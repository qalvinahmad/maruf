-- EMERGENCY FIX: Disable RLS to resolve teacher authentication issues
-- Run this in Supabase Dashboard -> SQL Editor

-- First, check current status
SELECT 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS Enabled - May cause 406 errors'
        ELSE 'RLS Disabled - Should work fine'
    END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'teacher_profiles', 'teacher_verifications')
ORDER BY tablename;

-- Drop ALL conflicting policies to prevent "already exists" errors
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON teacher_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teacher_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON teacher_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON teacher_verifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teacher_verifications;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON teacher_verifications;

-- Temporarily disable RLS on teacher tables to fix 406 errors
ALTER TABLE teacher_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_verifications DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on profiles but create simple, working policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "simple_profiles_read" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "simple_profiles_insert" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "simple_profiles_update" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT ALL ON teacher_profiles TO authenticated, service_role;
GRANT ALL ON teacher_verifications TO authenticated, service_role;

-- Verify the fix
SELECT 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '⚠️  RLS Enabled'
        ELSE '✅ RLS Disabled - Should work!'
    END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'teacher_profiles', 'teacher_verifications')
ORDER BY tablename;
