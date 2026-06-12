-- Zusammen App Schema
-- Im Supabase SQL Editor einmalig ausfuehren

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#0F766E',
  created_at timestamptz not null default now()
);

create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Sonstiges',
  done boolean not null default false,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time time,
  assigned_to uuid references profiles (id),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  done boolean not null default false,
  assigned_to uuid references profiles (id),
  due_date date,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  title text not null,
  ingredients text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists date_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Sonstiges',
  done boolean not null default false,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- Row Level Security
-- Alle angemeldeten Nutzer (also ihr zwei) duerfen alles sehen und bearbeiten

alter table profiles enable row level security;
alter table shopping_items enable row level security;
alter table events enable row level security;
alter table todos enable row level security;
alter table meals enable row level security;
alter table date_ideas enable row level security;

create policy "auth all" on profiles for all to authenticated using (true) with check (true);
create policy "auth all" on shopping_items for all to authenticated using (true) with check (true);
create policy "auth all" on events for all to authenticated using (true) with check (true);
create policy "auth all" on todos for all to authenticated using (true) with check (true);
create policy "auth all" on meals for all to authenticated using (true) with check (true);
create policy "auth all" on date_ideas for all to authenticated using (true) with check (true);

-- Realtime aktivieren

alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table shopping_items;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table todos;
alter publication supabase_realtime add table meals;
alter publication supabase_realtime add table date_ideas;
