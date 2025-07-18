import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to call send-email Edge Function
async function sendOTPEmail(teacherEmail: string, teacherName: string, otpCode: string, purpose: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: teacherEmail,
        teacher_name: teacherName,
        otp_code: otpCode,
        purpose: purpose,
        method: 'resend' // or 'smtp'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Email service error: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, purpose = 'enable_2fa' } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get teacher data
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from('teacher_profiles')
      .select('email, full_name, user_id')
      .eq('user_id', user_id)
      .single();

    if (teacherError || !teacher) {
      console.error('Teacher not found:', teacherError);
      return new Response(
        JSON.stringify({ error: 'Teacher not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!teacher.email) {
      return new Response(
        JSON.stringify({ error: 'Teacher email not found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Clean up any existing OTPs for this user
    await supabaseAdmin
      .from('teacher_otp')
      .delete()
      .eq('user_id', user_id);

    // Store OTP in database
    const { error: insertError } = await supabaseAdmin
      .from('teacher_otp')
      .insert({
        user_id: user_id,
        otp_code: otpCode,
        purpose: purpose,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store OTP' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send email using the dedicated email service
    try {
      const emailResult = await sendOTPEmail(
        teacher.email,
        teacher.full_name || 'Teacher',
        otpCode,
        purpose
      );

      console.log('Email sent successfully:', emailResult);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'OTP generated and email sent successfully',
          email_sent: true,
          masked_email: teacher.email.replace(/(.{2})(.*)(@.*)/, '$1****$3'),
          expires_at: expiresAt.toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // OTP was stored successfully but email failed
      return new Response(
        JSON.stringify({
          success: true,
          message: 'OTP generated successfully, but email sending failed',
          email_sent: false,
          email_error: emailError.message,
          otp_code: otpCode, // Include OTP in response if email failed
          expires_at: expiresAt.toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in generate-otp function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

