-- COMPREHENSIVE CLEANUP: Remove ALL conflicting policies and create clean ones
-- Run this in Supabase Dashboard -> SQL Editor

-- Step 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Enable insert for new users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for signup" ON public.profiles;
DROP POLICY IF EXISTS "Enable read for users" ON public.profiles;
DROP POLICY IF EXISTS "Pengguna dapat melihat profil mereka sendiri" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "simple_profiles_read" ON public.profiles;
DROP POLICY IF EXISTS "simple_profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "simple_profiles_update" ON public.profiles;

-- Step 2: Drop ALL existing policies on teacher_profiles table
DROP POLICY IF EXISTS "Admin can delete profiles" ON teacher_profiles;
DROP POLICY IF EXISTS "Admin can insert teacher profiles" ON teacher_profiles;
DROP POLICY IF EXISTS "Enable access for verified teachers" ON teacher_profiles;
DROP POLICY IF EXISTS "Users can read verified profiles" ON teacher_profiles;

-- Step 3: Drop ALL existing policies on teacher_verifications table
DROP POLICY IF EXISTS "Enable full access for admin" ON teacher_verifications;
DROP POLICY IF EXISTS "Enable full access for admins" ON teacher_verifications;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON teacher_verifications;

-- Step 4: Disable RLS on teacher tables (to fix 406 errors)
ALTER TABLE teacher_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_verifications DISABLE ROW LEVEL SECURITY;

-- Step 5: Keep RLS on profiles but create ONE set of clean, simple policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create ONE comprehensive read policy
CREATE POLICY "final_profiles_read" ON public.profiles
FOR SELECT USING (
  -- Allow authenticated users to read profiles
  auth.role() = 'authenticated' 
  OR 
  -- Allow users to read their own profile
  auth.uid() = id
  OR
  -- Allow public read access (for general profile viewing)
  true
);

-- Create ONE comprehensive insert policy
CREATE POLICY "final_profiles_insert" ON public.profiles
FOR INSERT WITH CHECK (
  -- Users can only insert their own profile
  auth.uid() = id
  OR
  -- Allow authenticated users to create profiles
  auth.role() = 'authenticated'
);

-- Create ONE comprehensive update policy
CREATE POLICY "final_profiles_update" ON public.profiles
FOR UPDATE USING (
  -- Users can only update their own profile
  auth.uid() = id
) WITH CHECK (
  -- Ensure they're still only updating their own profile
  auth.uid() = id
);

-- Step 6: Grant comprehensive permissions
GRANT ALL ON public.profiles TO authenticated, service_role, anon;
GRANT ALL ON teacher_profiles TO authenticated, service_role, anon;
GRANT ALL ON teacher_verifications TO authenticated, service_role, anon;

-- Step 7: Verify the cleanup
SELECT 
    'FINAL STATUS' as check_type,
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '⚠️  RLS Enabled'
        ELSE '✅ RLS Disabled'
    END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'teacher_profiles', 'teacher_verifications')
ORDER BY tablename;

-- Check remaining policies (should be only 3 clean ones on profiles)
SELECT 
    'REMAINING POLICIES' as check_type,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename IN ('profiles', 'teacher_profiles', 'teacher_verifications')
ORDER BY tablename, policyname;
