// Supabase Edge Function: send-otp-email
// Deploy this as an Edge Function in your Supabase project

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, otp_code, purpose } = await req.json()

    if (!email || !otp_code) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Method 1: Try using the reauthentication template directly
    try {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${Deno.env.get('SITE_URL')}/dashboard/teacher/DashboardSettingsTeacher`,
          data: {
            token: otp_code,
            purpose: purpose === 'enable_2fa' ? 'Aktivasi 2FA' : 'Nonaktifkan 2FA',
            type: 'reauthentication'
          }
        }
      })

      if (!error) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'OTP email sent successfully',
            email_sent: true
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } catch (linkError) {
      console.error('Generate link error:', linkError)
    }

    // Method 2: Send custom email using a custom email function
    try {
      const { data, error } = await supabaseAdmin.rpc('send_custom_email', {
        to_email: email,
        template_name: 'reauthentication',
        template_data: {
          token: otp_code,
          purpose: purpose === 'enable_2fa' ? 'Aktivasi 2FA' : 'Nonaktifkan 2FA'
        }
      })

      if (!error) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'OTP email sent via custom template',
            email_sent: true
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } catch (customError) {
      console.error('Custom email error:', customError)
    }

    // If all methods fail, return failure but still success for the OTP generation
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP generated but email sending failed',
        email_sent: false,
        otp_code: otp_code // Return OTP if email failed
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
