-- First drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update or create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Only insert into teacher_profiles if the user has a teacher role
  IF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (
      id,
      email,
      full_name,
      is_verified,
      status
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      false,
      'pending'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies are correct
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Update policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.teacher_profiles;
CREATE POLICY "Users can insert their own profile"
ON public.teacher_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.teacher_profiles;
CREATE POLICY "Users can view their own profile"
ON public.teacher_profiles
FOR SELECT
USING (auth.uid() = id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_status ON public.teacher_profiles(status);
