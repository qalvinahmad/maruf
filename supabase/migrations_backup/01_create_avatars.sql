create table public.avatars (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  animation_url text,  -- stores .mp4 file URL
  border_style text default 'gray',  -- gray, primary, secondary, etc
  border_color text,  -- gradient colors in JSON format
  badge_type text default 'none',  -- none, streaming, recording, award, active
  badge_color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.avatars enable row level security;

-- Create policies
create policy "Users can view their own avatar"
  on public.avatars for select
  using ( auth.uid() = user_id );

create policy "Users can update their own avatar"
  on public.avatars for update
  using ( auth.uid() = user_id );
