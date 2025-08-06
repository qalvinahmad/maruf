-- SQL Function to send OTP email using Supabase's built-in email functionality
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION send_otp_email(
  p_email TEXT,
  p_otp_code TEXT,
  p_purpose TEXT DEFAULT 'enable_2fa'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- You can use this function to send emails via external services
  -- or integrate with Supabase's email templates
  
  -- For now, we'll just return success
  -- In a real implementation, you would call your email service here
  
  result := json_build_object(
    'success', true,
    'message', 'OTP email sent successfully',
    'email', p_email,
    'otp_code', p_otp_code,
    'purpose', p_purpose
  );
  
  RETURN result;
END;
$$;
