-- Check current status constraints in teacher_profiles
SELECT 
    conname,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'teacher_profiles'::regclass 
    AND contype = 'c'
    AND conname LIKE '%status%';

-- Check current values in status column
SELECT DISTINCT status, COUNT(*) 
FROM teacher_profiles 
GROUP BY status;

-- Check what values are actually allowed
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'teacher_profiles' 
    AND column_name = 'status';
