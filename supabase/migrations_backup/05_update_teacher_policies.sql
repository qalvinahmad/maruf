-- Drop existing policies
drop policy if exists "Allow all users to view teacher verifications" on public.teacher_verifications;
drop policy if exists "Allow admins to insert teacher verifications" on public.teacher_verifications;
drop policy if exists "Allow admins to update teacher verifications" on public.teacher_verifications;

-- Create new simplified policies for testing
create policy "Enable read access for all users"
  on public.teacher_verifications for select
  using (true);

create policy "Enable write access for all users"
  on public.teacher_verifications for insert
  with check (true);

create policy "Enable update access for all users"
  on public.teacher_verifications for update
  using (true);

-- Add index for better query performance
create index if not exists teacher_verifications_created_at_idx 
  on public.teacher_verifications(created_at desc);
