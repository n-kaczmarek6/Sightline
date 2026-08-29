-- Migration 0014: Blog für SEO-Content
--
-- Admin-Flag auf profiles (bisher gab es kein Rollenkonzept) + eigene
-- blog_posts-Tabelle. Öffentlich lesbar sind nur veröffentlichte Beiträge;
-- Entwürfe sehen und Beiträge anlegen/bearbeiten/löschen dürfen nur Admins.

alter table profiles add column if not exists is_admin boolean not null default false;

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  slug text not null unique,
  title text not null,
  excerpt text,
  
  content text not null, -- Markdown
  cover_image_url text,
  meta_title text,
  meta_description text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on blog_posts
  for each row execute function set_updated_at();

alter table blog_posts enable row level security;

create policy "blog_posts: öffentlich lesbar wenn veröffentlicht"
  on blog_posts for select
  using (published = true);

create policy "blog_posts: Admins sehen auch Entwürfe"
  on blog_posts for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

create policy "blog_posts: nur Admins erstellen"
  on blog_posts for insert
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

create policy "blog_posts: nur Admins bearbeiten"
  on blog_posts for update
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

create policy "blog_posts: nur Admins löschen"
  on blog_posts for delete
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

create index if not exists blog_posts_published_idx on blog_posts (published, published_at desc);
