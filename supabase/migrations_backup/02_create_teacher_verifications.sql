-- Create enum type for verification status
create type teacher_status as enum ('pending', 'verified', 'rejected');

-- Create teacher verifications table
create table public.teacher_verifications (
    id uuid default uuid_generate_v4() primary key,
    full_name varchar(255) not null,
    email varchar(255) not null unique,
    institution varchar(255) not null,
    registration_date timestamptz default now(),
    status teacher_status default 'pending',
    verified_by uuid references auth.users(id),
    verification_date timestamptz,
    rejection_reason text,
    credentials jsonb, -- Store credential documents URLs
    documents jsonb, -- Store supporting documents URLs
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.teacher_verifications enable row level security;

-- Create policies for access control
create policy "Admins can view all verifications"
on public.teacher_verifications for select
using (
    auth.jwt() ->> 'role' = 'admin'
);

create policy "Admins can insert verifications"
on public.teacher_verifications for insert
with check (
    auth.jwt() ->> 'role' = 'admin'
);

create policy "Admins can update verifications"
on public.teacher_verifications for update
using (
    auth.jwt() ->> 'role' = 'admin'
);

-- Create indexes for better query performance
create index idx_teacher_verifications_status on public.teacher_verifications(status);
create index idx_teacher_verifications_email on public.teacher_verifications(email);
create index idx_teacher_verifications_registration_date on public.teacher_verifications(registration_date);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_teacher_verifications_updated_at
    before update on public.teacher_verifications
    for each row
    execute function public.handle_updated_at();

-- Insert some sample data
insert into public.teacher_verifications 
(full_name, email, institution, status) 
values 
('Ustadz Ahmad Fauzi', 'ahmad.fauzi@example.com', 'Pondok Pesantren Al-Hikmah', 'pending'),
('Ustadzah Fatimah Azzahra', 'fatimah@example.com', 'Madrasah Aliyah Nurul Iman', 'verified'),
('Ustadz Umar Hadi', 'umar.hadi@example.com', 'Pondok Pesantren Darussalam', 'pending'),
('Ustadzah Aisyah Putri', 'aisyah@example.com', 'Madrasah Tsanawiyah Al-Furqan', 'rejected'),
('Ustadz Ali Rahman', 'ali.rahman@example.com', 'Pondok Pesantren Al-Ikhlas', 'verified');
