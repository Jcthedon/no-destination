-- ── No Destination — Supabase Schema ──────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New query

-- Enable pgvector extension (needed for future vector matching upgrade)
create extension if not exists vector;

-- ── profiles ───────────────────────────────────────────────────────────────
-- Extended user info pulled from Google OAuth metadata
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        avatar_url   = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── user_profiles ──────────────────────────────────────────────────────────
-- Stores quiz results (7-dimension personality vector + raw answers)
create table if not exists public.user_profiles (
  user_id     uuid primary key references auth.users on delete cascade,
  pace        integer not null check (pace between 0 and 100),
  environment integer not null check (environment between 0 and 100),
  culture     integer not null check (culture between 0 and 100),
  adventure   integer not null check (adventure between 0 and 100),
  food        integer not null check (food between 0 and 100),
  budget      integer not null check (budget between 0 and 100),
  climate     integer not null check (climate between 0 and 100),
  answers     jsonb,
  updated_at  timestamptz default now()
);

-- ── saved_countries ────────────────────────────────────────────────────────
create table if not exists public.saved_countries (
  user_id      uuid references auth.users on delete cascade,
  country_code text not null,
  saved_at     timestamptz default now(),
  primary key (user_id, country_code)
);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.user_profiles  enable row level security;
alter table public.saved_countries enable row level security;

-- profiles: users can only read/write their own row
create policy "profiles: own row only"
  on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- user_profiles: users can only read/write their own row
create policy "user_profiles: own row only"
  on public.user_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- saved_countries: users can only read/write their own rows
create policy "saved_countries: own rows only"
  on public.saved_countries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Group trips ────────────────────────────────────────────────────────────

create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null,
  creator_id  uuid references auth.users on delete set null,
  created_at  timestamptz default now()
);

create table if not exists public.group_members (
  group_id  uuid references public.groups on delete cascade,
  user_id   uuid references auth.users on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_messages (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid references public.groups on delete cascade,
  user_id    uuid references auth.users on delete cascade,
  content    text not null check (char_length(content) <= 500),
  created_at timestamptz default now()
);

alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.group_messages enable row level security;

-- Authenticated users can read/create groups (invite code is the access control)
create policy "groups: authenticated read"
  on public.groups for select to authenticated using (true);
create policy "groups: authenticated create"
  on public.groups for insert to authenticated with check (auth.uid() = creator_id);

-- Group members
create policy "group_members: authenticated read"
  on public.group_members for select to authenticated using (true);
create policy "group_members: join own"
  on public.group_members for insert to authenticated with check (auth.uid() = user_id);
create policy "group_members: leave own"
  on public.group_members for delete to authenticated using (auth.uid() = user_id);

-- Group messages
create policy "group_messages: authenticated read"
  on public.group_messages for select to authenticated using (true);
create policy "group_messages: send own"
  on public.group_messages for insert to authenticated with check (auth.uid() = user_id);

-- Enable realtime for group_messages
alter publication supabase_realtime add table public.group_messages;
