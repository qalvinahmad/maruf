-- Create enum for event types and status
create type event_type as enum ('Acara', 'Sistem', 'Program', 'Peringatan', 'Fitur');
create type event_status as enum ('Aktif', 'Dijadwalkan', 'Selesai');

-- Create events table
create table public.events (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    type event_type not null,
    description text,
    event_date date not null,
    status event_status default 'Dijadwalkan',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Insert sample data
insert into public.events (title, type, description, event_date, status) values
    ('Kompetisi Membaca Al-Qur''an Online', 'Acara', 'Ikuti kompetisi membaca Al-Qur''an online pada tanggal 25 Agustus 2023. Pendaftaran dibuka mulai 1 Agustus 2023.', '2023-06-28', 'Dijadwalkan'),
    ('Pembaruan Aplikasi Mobile', 'Sistem', 'Aplikasi mobile kami telah diperbarui dengan fitur baru dan perbaikan bug. Silakan perbarui aplikasi Anda ke versi terbaru.', '2023-06-20', 'Aktif'),
    ('Ramadan Challenge: 30 Modul dalam 30 Hari', 'Program', 'Ikuti tantangan Ramadan: selesaikan 1 modul setiap hari selama 30 hari penuh di bulan Ramadan.', '2023-03-23', 'Selesai'),
    ('Aktivitas Khusus 10 Hari Pertama Dzulhijjah', 'Program', 'Manfaatkan 10 hari pertama Dzulhijjah dengan aktivitas ibadah dan pembelajaran Al-Qur''an khusus.', '2023-06-19', 'Selesai'),
    ('Peringatan Isra Mi''raj', 'Peringatan', 'Peringatan Isra Mi''raj Nabi Muhammad SAW pada 27 Rajab dengan kajian dan tilawah bersama.', '2023-02-18', 'Selesai'),
    ('Aktivitas Nisfu Sya''ban', 'Program', 'Ayo maksimalkan malam Nisfu Sya''ban (15 Sya''ban) dengan dzikir, doa, dan tilawah Al-Qur''an.', '2023-03-07', 'Selesai');

-- Add RLS policies
alter table public.events enable row level security;

create policy "Events are viewable by everyone"
    on public.events for select
    using (true);

create policy "Events are editable by admin"
    on public.events for all
    using (auth.uid() in (select user_id from public.admin_roles where role = 'admin'));

-- Create indexes
create index events_type_idx on public.events(type);
create index events_status_idx on public.events(status);
create index events_date_idx on public.events(event_date);
