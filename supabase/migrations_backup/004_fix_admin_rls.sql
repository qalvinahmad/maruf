-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow insert during registration" ON admin_profiles;

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper checks
CREATE POLICY "Enable all access for authenticated users"
ON public.admin_profiles
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow public read for specific columns
CREATE POLICY "Allow public read access to basic info"
ON public.admin_profiles
FOR SELECT
USING (true);

-- Allow self-insert during registration
CREATE POLICY "Allow self insert during registration"
ON public.admin_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow administrators to manage all profiles
CREATE POLICY "Allow administrators full access"
ON public.admin_profiles
FOR ALL
USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid() 
    AND admin_profiles.role = 'admin'
));
