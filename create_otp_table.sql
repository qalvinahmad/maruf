-- SQL Script to create OTP codes table for 2FA functionality
-- Run this in your Supabase SQL editor if the table doesn't exist

CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code VARCHAR(4) NOT NULL,
    purpose VARCHAR(20) NOT NULL DEFAULT 'enable_2fa',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON otp_codes(email, otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Optional: Create a function to automatically clean expired OTPs
CREATE OR REPLACE FUNCTION clean_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean expired OTPs every hour
-- This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('clean-expired-otps', '0 * * * *', 'SELECT clean_expired_otps();');
