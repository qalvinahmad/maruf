-- Tabel untuk pengumuman umum
create table announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  message text not null,
  type text check (type in ('system', 'feature', 'info', 'important')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references auth.users(id),
  is_active boolean default true
);

-- Tabel untuk notifikasi personal
create table personal_notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  message text not null,
  type text check (type in ('achievement', 'reminder', 'info')),
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- Function untuk update timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger untuk update timestamp
create trigger update_announcements_updated_at
  before update on announcements
  for each row
  execute function update_updated_at_column();
