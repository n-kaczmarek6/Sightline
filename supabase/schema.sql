-- Sightline — Initial Datenbank-Schema (Supabase/Postgres)
--
-- Reihenfolge wichtig: profiles zuerst (referenziert auth.users), dann alles,
-- was profiles referenziert. applications kommt vor cv_versions/job_analyses,
-- damit deren optionale application_id-FK direkt gesetzt werden kann.
--
-- Auth: Supabase legt auth.users automatisch an (E-Mail/Passwort, Schritt 3).
-- profiles.id = auth.users.id (1:1), kein separates "users"-Tabellen-Duplikat.

-- ============================================================
-- profiles — 1:1 Erweiterung von auth.users
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  location text,
  linkedin_url text,
  phone text,
  target_roles text[] default '{}',
  target_locations text[] default '{}',
  work_model text, -- z.B. 'remote' | 'hybrid' | 'onsite'
  salary_min int,
  salary_max int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Legt automatisch eine profiles-Zeile an, sobald sich jemand registriert.
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- skills — n:1 zu profiles
-- ============================================================
create table skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (profile_id, name)
);

-- ============================================================
-- education — n:1 zu profiles
-- ============================================================
create table education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  degree text not null,
  field_of_study text,
  institution text not null,
  location text,
  start_date date,
  end_date date, -- null = laufend
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- work_experience — n:1 zu profiles
-- ============================================================
create table work_experience (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  company text not null,
  location text,
  start_date date,
  end_date date, -- null = "heute"
  bullets text[] default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- documents — Evidence Vault, n:1 zu profiles
-- ============================================================
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('certificate', 'review', 'education', 'other')),
  file_path text, -- Pfad in Supabase Storage
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- applications — Kanban-Board, n:1 zu profiles
-- ============================================================
create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  company text not null,
  role_title text not null,
  status text not null default 'saved'
    check (status in ('saved', 'applied', 'screening', 'interview', 'offer', 'rejected')),
  match_score int check (match_score between 0 and 100),
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- cv_versions — wiederverwendbare CV-Bibliothek, n:1 zu profiles,
-- optional n:1 zu applications (welcher Bewerbung diese Version zugeschnitten wurde)
-- ============================================================
create table cv_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  label text not null, -- z.B. "Product Marketing Manager v4"
  summary text,
  experience_text text,
  education_text text,
  skills_text text,
  achievements_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- job_analyses — Match-Analyse-Ergebnisse, n:1 zu profiles,
-- optional n:1 zu applications
-- ============================================================
create table job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  job_title text,
  company text,
  job_description text not null,
  source_url text,
  match_score int check (match_score between 0 and 100),
  scores jsonb not null default '{}', -- { skills_match, experience_match, keyword_coverage, education_match, ats_readiness }
  strengths jsonb not null default '[]',
  gaps jsonb not null default '[]',
  keywords jsonb not null default '[]', -- [{ category, label, status, detail, suggestion }]
  recommendations jsonb not null default '[]', -- [{ priority, impact, title, current, suggested }]
  created_at timestamptz not null default now()
);

-- ============================================================
-- subscriptions — Plan-Status, 1:1 zu profiles
-- ============================================================
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro_monthly', 'pro_sprint')),
  status text not null default 'active' check (status in ('active', 'canceled', 'expired')),
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  analyses_used int not null default 0,
  ai_messages_used int not null default 0,
  period_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- updated_at automatisch pflegen
-- ============================================================
create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger set_updated_at before update on applications
  for each row execute function set_updated_at();
create trigger set_updated_at before update on cv_versions
  for each row execute function set_updated_at();
create trigger set_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security — jede/r Nutzer/in sieht nur eigene Daten
-- ============================================================
alter table profiles enable row level security;
alter table skills enable row level security;
alter table education enable row level security;
alter table work_experience enable row level security;
alter table documents enable row level security;
alter table applications enable row level security;
alter table cv_versions enable row level security;
alter table job_analyses enable row level security;
alter table subscriptions enable row level security;

create policy "profiles: eigene Zeile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "skills: eigenes Profil" on skills
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "education: eigenes Profil" on education
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "work_experience: eigenes Profil" on work_experience
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "documents: eigene Zeilen" on documents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "applications: eigene Zeilen" on applications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cv_versions: eigene Zeilen" on cv_versions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "job_analyses: eigene Zeilen" on job_analyses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "subscriptions: eigene Zeile" on subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
