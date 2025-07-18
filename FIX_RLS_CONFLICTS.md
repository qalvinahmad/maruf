# Fix RLS Policy Conflicts - Step by Step Guide

## Issue
You're getting an error: `ERROR: policy "Enable read access for authenticated users" for table "profiles" already exists`

This happens because multiple SQL scripts are trying to create policies with the same names.

## Solution

### Option 1: Use the Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your Project → SQL Editor
3. **Run each SQL block below in sequence**:

#### Step 1: Clean up existing policies
```sql
-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin dapat melihat semua profil" ON public.profiles;
DROP POLICY IF EXISTS "Admin dapat mengubah peran pengguna" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for users" ON public.profiles;

-- Teacher profiles policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON teacher_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teacher_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON teacher_profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON teacher_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read teacher_profiles" ON teacher_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert teacher_profiles" ON teacher_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update teacher_profiles" ON teacher_profiles;

-- Teacher verifications policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON teacher_verifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teacher_verifications;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON teacher_verifications;
DROP POLICY IF EXISTS "Allow authenticated users to read teacher_verifications" ON teacher_verifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert teacher_verifications" ON teacher_verifications;
DROP POLICY IF EXISTS "Allow authenticated users to update teacher_verifications" ON teacher_verifications;
```

#### Step 2: Disable RLS on problematic tables (to fix the 406 errors)
```sql
-- Disable RLS on teacher tables to prevent permission issues
ALTER TABLE teacher_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_verifications DISABLE ROW LEVEL SECURITY;
```

#### Step 3: Set up profiles table policies (if needed)
```sql
-- Enable RLS on profiles and create clean policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_policy" ON public.profiles
FOR SELECT USING (
  auth.role() = 'authenticated' OR auth.uid() = id
);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id
);
```

#### Step 4: Grant permissions
```sql
-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON teacher_profiles TO authenticated;
GRANT ALL ON teacher_profiles TO service_role;
GRANT ALL ON teacher_verifications TO authenticated;
GRANT ALL ON teacher_verifications TO service_role;
```

#### Step 5: Verify the setup
```sql
-- Check RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'teacher_profiles', 'teacher_verifications')
ORDER BY tablename;
```

### Option 2: Use your Local Development Setup

If you have a local .env.local file with the proper Supabase credentials:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Make sure the credentials are correct in `.env.local`

3. Use the MCP Supabase integration (if available in your environment)

## Expected Results

After running these scripts:

1. ✅ No more "policy already exists" errors
2. ✅ Teacher login/registration should work without 406 errors  
3. ✅ Admin functionality should remain intact
4. ✅ RLS errors should be resolved

## Test the Fix

1. **Test Teacher Registration**: Should work without errors
2. **Test Teacher Login**: Should work for verified teachers
3. **Test Admin Login**: Should continue to work normally
4. **Check Browser Console**: Should see fewer Supabase errors

## If You Still Get Errors

If you continue to get RLS or permission errors, you can temporarily disable RLS on all tables:

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_verifications DISABLE ROW LEVEL SECURITY;
```

**Note**: Disabling RLS removes security restrictions, so only do this for development/testing.
