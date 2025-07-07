-- First, drop existing policies if needed (only if you want to recreate them)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies with unique names
CREATE POLICY "Enable read access for users" ON profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable update access for users" ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Enable insert access for users" ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
