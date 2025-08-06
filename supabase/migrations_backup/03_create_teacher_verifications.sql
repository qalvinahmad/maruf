-- Create enum for verification status
create type public.teacher_status as enum ('pending', 'verified', 'rejected');

-- Create teacher verifications table
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
create policy "Public profiles are viewable by admin"
  on public.teacher_verifications for select
  using ( auth.role() = 'admin' );

create policy "Admin can insert teacher verification"
  on public.teacher_verifications for insert
  with check ( auth.role() = 'admin' );

create policy "Admin can update teacher verification"
  on public.teacher_verifications for update
  using ( auth.role() = 'admin' );

-- Insert sample data
insert into public.teacher_verifications (full_name, email, institution, status)
values 
  ('Ustadz Ahmad Fauzi', 'ahmad.fauzi@example.com', 'Pondok Pesantren Al-Hikmah', 'pending'),
  ('Ustadzah Fatimah Azzahra', 'fatimah@example.com', 'Madrasah Aliyah Nurul Iman', 'verified');
