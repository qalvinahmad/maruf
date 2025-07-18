-- Drop existing table and type
drop table if exists public.teacher_verifications cascade;
drop type if exists public.teacher_status cascade;

-- Recreate the type and table
create type public.teacher_status as enum ('pending', 'verified', 'rejected');

create table public.teacher_verifications (
  id uuid default uuid_generate_v4() primary key,
  full_name character varying not null,
  email character varying not null unique,
  institution character varying not null,
  registration_date timestamp with time zone default now(),
  status public.teacher_status default 'pending',
  verified_by uuid references auth.users(id),
  verification_date timestamp with time zone,
  rejection_reason text,
  credentials jsonb,
  documents jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.teacher_verifications enable row level security;

-- Create policies
create policy "Allow all users to view teacher verifications" 
  on public.teacher_verifications for select 
  using (true);

create policy "Allow admins to insert teacher verifications" 
  on public.teacher_verifications for insert 
  with check (true);

create policy "Allow admins to update teacher verifications" 
  on public.teacher_verifications for update 
  using (true);

-- Insert test data
insert into public.teacher_verifications (full_name, email, institution, status)
values 
  ('Ustadz Ahmad Fauzi', 'ahmad.fauzi@example.com', 'Pondok Pesantren Al-Hikmah', 'pending'),
  ('Ustadzah Fatimah Azzahra', 'fatimah@example.com', 'Madrasah Aliyah Nurul Iman', 'verified'),
  ('Ustadz Umar Hadi', 'umar.hadi@example.com', 'Pondok Pesantren Darussalam', 'pending'),
  ('Ustadzah Aisyah Putri', 'aisyah@example.com', 'Madrasah Tsanawiyah Al-Furqan', 'rejected'),
  ('Ustadz Ali Rahman', 'ali.rahman@example.com', 'Pondok Pesantren Al-Ikhlas', 'verified');
