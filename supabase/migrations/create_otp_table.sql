-- Create OTP table for 2FA verification
CREATE TABLE IF NOT EXISTS teacher_otp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    otp_code VARCHAR(4) NOT NULL,
    purpose VARCHAR(20) NOT NULL DEFAULT 'enable_2fa', -- 'enable_2fa', 'login', 'disable_2fa'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_otp_teacher_id ON teacher_otp(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_otp_code ON teacher_otp(otp_code);
CREATE INDEX IF NOT EXISTS idx_teacher_otp_expires ON teacher_otp(expires_at);

-- Enable RLS
ALTER TABLE teacher_otp ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can insert their own OTP" ON teacher_otp
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can view their own OTP" ON teacher_otp
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own OTP" ON teacher_otp
    FOR UPDATE USING (auth.uid() = teacher_id);

-- Function to clean expired OTP codes
CREATE OR REPLACE FUNCTION clean_expired_otp()
RETURNS void AS $$
BEGIN
    DELETE FROM teacher_otp 
    WHERE expires_at < NOW() OR is_used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add 2FA columns to teacher_profiles if not exists
ALTER TABLE teacher_profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(32),
ADD COLUMN IF NOT EXISTS backup_codes TEXT[];

COMMENT ON TABLE teacher_otp IS 'Stores OTP codes for teacher 2FA verification';
COMMENT ON COLUMN teacher_otp.purpose IS 'Purpose of OTP: enable_2fa, login, disable_2fa';
COMMENT ON COLUMN teacher_profiles.two_factor_enabled IS 'Whether 2FA is enabled for this teacher';
COMMENT ON COLUMN teacher_profiles.two_factor_secret IS 'Secret key for TOTP generation';
COMMENT ON COLUMN teacher_profiles.backup_codes IS 'Array of backup codes for 2FA recovery';
