-- Drop existing policies
drop policy if exists "Enable read access for all users" on public.teacher_verifications;
drop policy if exists "Enable write access for all users" on public.teacher_verifications;
drop policy if exists "Enable update access for all users" on public.teacher_verifications;

-- Disable RLS temporarily
alter table public.teacher_verifications disable row level security;

-- Insert sample data with proper type casting
insert into public.teacher_verifications (full_name, email, institution, status)
select * from (
  values 
    ('Ustadz Ahmad Fauzi', 'ahmad.fauzi@example.com', 'Pondok Pesantren Al-Hikmah', 'pending'::teacher_status),
    ('Ustadzah Fatimah Azzahra', 'fatimah@example.com', 'Madrasah Aliyah Nurul Iman', 'verified'::teacher_status),
    ('Ustadz Umar Hadi', 'umar.hadi@example.com', 'Pondok Pesantren Darussalam', 'pending'::teacher_status),
    ('Ustadzah Aisyah Putri', 'aisyah@example.com', 'Madrasah Tsanawiyah Al-Furqan', 'rejected'::teacher_status),
    ('Ustadz Ali Rahman', 'ali.rahman@example.com', 'Pondok Pesantren Al-Ikhlas', 'verified'::teacher_status)
) as new_data(full_name, email, institution, status)
where not exists (
  select 1 from public.teacher_verifications 
  where email = new_data.email
);

-- Verify the data was inserted
select * from public.teacher_verifications;
