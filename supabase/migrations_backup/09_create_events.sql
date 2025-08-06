-- Create event type enum
create type event_type as enum ('Acara', 'Sistem', 'Fitur', 'Program', 'Peringatan');
create type event_status as enum ('Aktif', 'Dijadwalkan', 'Selesai');

-- Create events table
create table public.events (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) not null,
    type event_type not null,
    description text,
    event_date date not null,
    status event_status default 'Dijadwalkan',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    created_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.events enable row level security;

-- Create policies
create policy "Events are viewable by everyone"
  on public.events for select
  using ( true );

create policy "Events are editable by admin"
  on public.events for insert
  with check ( true );

create policy "Events are updatable by admin"
  on public.events for update
  using ( true );

-- Insert sample data
insert into public.events (title, type, description, event_date, status) values 
('Pemeliharaan Sistem', 'Sistem', 'Sistem akan mengalami pemeliharaan.', '2023-07-10', 'Aktif'),
('Update Fitur Baru', 'Fitur', 'Fitur baru telah ditambahkan.', '2023-07-05', 'Aktif');
