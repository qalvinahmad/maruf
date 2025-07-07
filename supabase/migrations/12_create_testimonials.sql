create table public.testimonials (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    profession varchar(255) not null,
    testimonial text not null,
    rating integer check (rating between 1 and 5),
    show_in_landing boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.testimonials enable row level security;

-- Create policies
create policy "Testimonials are viewable by everyone"
    on public.testimonials for select
    using ( true );

create policy "Testimonials are editable by authenticated users"
    on public.testimonials for all
    using ( auth.uid() is not null );
