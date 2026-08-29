-- Zweiter Score neben job_analyses.match_score (Ausgangslage: Profil vs.
-- Stellenausschreibung, vor jeder Anpassung). Dieser hier bewertet den
-- tatsächlichen Text einer CV-Version (nach Optimierung/KI-Generierung) neu
-- gegen dieselbe Stellenausschreibung — "wie gut stehen die Chancen jetzt".
alter table cv_versions add column if not exists match_score int check (match_score between 0 and 100);
alter table cv_versions add column if not exists scores jsonb not null default '{}';
