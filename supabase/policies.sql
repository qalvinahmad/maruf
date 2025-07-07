-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clear existing policies
DROP POLICY IF EXISTS "Admin dapat melihat semua profil" ON public.profiles;
DROP POLICY IF EXISTS "Admin dapat mengubah peran pengguna" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create simplified policies
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
FOR SELECT USING (
  auth.role() = 'authenticated' OR auth.uid() = id
);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Enable update for users based on id" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id
);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
