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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { teacher_id, otp_code, purpose = 'enable_2fa' } = await req.json()

    if (!teacher_id || !otp_code) {
      return new Response(
        JSON.stringify({ error: 'Teacher ID and OTP code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify OTP
    const { data: otpData, error: otpError } = await supabaseClient
      .from('teacher_otp')
      .select('*')
      .eq('teacher_id', teacher_id)
      .eq('otp_code', otp_code)
      .eq('purpose', purpose)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpData) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired OTP code',
          valid: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Mark OTP as used
    await supabaseClient
      .from('teacher_otp')
      .update({ is_used: true })
      .eq('id', otpData.id)

    // If verifying for enabling 2FA, update teacher profile
    if (purpose === 'enable_2fa') {
      const { error: updateError } = await supabaseClient
        .from('teacher_profiles')
        .update({ two_factor_enabled: true })
        .eq('id', teacher_id)

      if (updateError) {
        console.error('Error updating teacher profile:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to enable 2FA' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } else if (purpose === 'disable_2fa') {
      const { error: updateError } = await supabaseClient
        .from('teacher_profiles')
        .update({ two_factor_enabled: false })
        .eq('id', teacher_id)

      if (updateError) {
        console.error('Error updating teacher profile:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to disable 2FA' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        valid: true,
        message: `OTP verified successfully for ${purpose}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in verify-otp function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
