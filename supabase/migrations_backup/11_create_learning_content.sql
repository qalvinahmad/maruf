-- Create content type enum
create type content_type as enum ('Materi Dasar', 'Materi Lanjutan', 'Latihan Praktik', 'Evaluasi');
create type content_status as enum ('Aktif', 'Draft', 'Dalam Review', 'Nonaktif');
create type content_level as enum ('Pemula', 'Menengah', 'Lanjutan');

-- Create learning content table
create table public.learning_contents (
    id uuid default uuid_generate_v4() primary key,
    title varchar(255) not null,
    category content_type not null,
    level content_level not null,
    author uuid references auth.users(id),
    author_name varchar(255),
    description text,
    content_url text,
    status content_status default 'Draft',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create accuracy settings table
create table public.accuracy_settings (
    id uuid default uuid_generate_v4() primary key,
    level content_level not null unique,
    min_accuracy integer not null check (min_accuracy between 0 and 100),
    recommended_range jsonb not null,
    updated_at timestamptz default now(),
    updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.learning_contents enable row level security;
alter table public.accuracy_settings enable row level security;

-- Create policies
create policy "Content is viewable by everyone"
    on public.learning_contents for select
    using ( true );

create policy "Content is editable by authenticated users"
    on public.learning_contents for all
    using ( auth.uid() is not null );

create policy "Accuracy settings viewable by everyone"
    on public.accuracy_settings for select
    using ( true );

create policy "Accuracy settings editable by authenticated users"
    on public.accuracy_settings for all
    using ( auth.uid() is not null );

-- Insert default accuracy settings
insert into public.accuracy_settings (level, min_accuracy, recommended_range) values
('Pemula', 60, '{"min": 60, "max": 70}'::jsonb),
('Menengah', 70, '{"min": 70, "max": 80}'::jsonb),
('Lanjutan', 80, '{"min": 80, "max": 90}'::jsonb);
