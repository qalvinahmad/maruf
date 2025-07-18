-- Add 2FA support to teacher_profiles table
-- This script adds the two_factor_enabled column if it doesn't exist

DO $$ 
BEGIN
    -- Check if the column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teacher_profiles' 
        AND column_name = 'two_factor_enabled'
    ) THEN
        ALTER TABLE teacher_profiles 
        ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
        
        -- Add comment for documentation
        COMMENT ON COLUMN teacher_profiles.two_factor_enabled 
        IS 'Indicates whether Two-Factor Authentication is enabled for this teacher account';
        
        RAISE NOTICE 'Column two_factor_enabled added to teacher_profiles table';
    ELSE
        RAISE NOTICE 'Column two_factor_enabled already exists in teacher_profiles table';
    END IF;
END $$;
