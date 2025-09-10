-- Supabase schema for WeVote
-- Run this in Supabase SQL editor to create the tables used by the app.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  creator_id uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists topic_options (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  label text not null,
  votes integer default 0
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  option_id uuid references topic_options(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists topic_images (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade,
  url text,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_topics_created_at on topics(created_at desc);
