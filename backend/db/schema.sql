-- Glitch Broadcast — Supabase schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "uuid-ossp";

-- Media & files in the Content Vault
create table if not exists content_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  folder text default 'general',
  file_url text,
  file_type text,          -- image, video, document
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

-- A single "idea" that gets rewritten per platform
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  title text,
  base_content text not null,          -- the raw idea / source text
  status text default 'draft',         -- draft, scheduled, published, failed
  scheduled_for timestamptz,
  created_at timestamptz default now()
);

-- Per-platform generated variant of a post (Gemini output lives here)
create table if not exists post_variants (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  platform text not null,              -- facebook_page, instagram, linkedin, facebook_group
  content text not null,
  hashtags text[] default '{}',
  media_ids uuid[] default '{}',
  target_group_name text,              -- only used for facebook_group (assisted posting)
  target_group_url text,
  location_tag text,
  publish_status text default 'pending', -- pending, posted, failed, needs_manual_review
  platform_post_id text,               -- id returned by the official API, if applicable
  error_message text,
  posted_at timestamptz,
  created_at timestamptz default now()
);

-- Chat history with the AI assistant
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  role text not null,        -- user, assistant
  content text not null,
  created_at timestamptz default now()
);

-- Assisted-posting queue for Facebook Groups (Puppeteer fallback)
create table if not exists assisted_posting_queue (
  id uuid primary key default uuid_generate_v4(),
  post_variant_id uuid references post_variants(id) on delete cascade,
  group_url text not null,
  status text default 'queued',  -- queued, in_progress, awaiting_manual_click, done, failed
  log text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_post_variants_post_id on post_variants(post_id);
create index if not exists idx_assisted_queue_status on assisted_posting_queue(status);
