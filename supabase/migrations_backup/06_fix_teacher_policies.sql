-- Drop all existing policies to start fresh
drop policy if exists "Enable read access for all users" on public.teacher_verifications;
drop policy if exists "Enable write access for all users" on public.teacher_verifications;
drop policy if exists "Enable update access for all users" on public.teacher_verifications;

-- Disable RLS temporarily for testing
alter table public.teacher_verifications disable row level security;

-- Verify existing data
select * from public.teacher_verifications;

-- Re-insert test data if needed
insert into public.teacher_verifications (full_name, email, institution, status)
select * from (
  values 
    ('Ustadz Ahmad Fauzi', 'ahmad.fauzi@example.com', 'Pondok Pesantren Al-Hikmah', 'pending'),
    ('Ustadzah Fatimah Azzahra', 'fatimah@example.com', 'Madrasah Aliyah Nurul Iman', 'verified'),
    ('Ustadz Umar Hadi', 'umar.hadi@example.com', 'Pondok Pesantren Darussalam', 'pending'),
    ('Ustadzah Aisyah Putri', 'aisyah@example.com', 'Madrasah Tsanawiyah Al-Furqan', 'rejected'),
    ('Ustadz Ali Rahman', 'ali.rahman@example.com', 'Pondok Pesantren Al-Ikhlas', 'verified')
) as new_data(full_name, email, institution, status)
where not exists (
  select 1 from public.teacher_verifications 
  where email = new_data.email
);
