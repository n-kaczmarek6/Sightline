-- Sightline — Migration 0001: Sprachfelder
--
-- Unabhängig von der UI-Sprache (de/en, siehe next-intl-Setup): hier geht es
-- um die Sprache der eigentlichen Inhalte (CV-Text, Job Description), damit
-- die KI-Analyse später weiß, in welcher Sprache sie arbeiten soll.

-- Bevorzugte UI-Sprache des Nutzers (Standard: Deutsch)
alter table profiles
  add column if not exists locale text not null default 'de' check (locale in ('de', 'en'));

-- Sprache des jeweiligen CV-Inhalts bzw. der analysierten Job Description.
-- Bewusst nicht auf 'de'/'en' beschränkt (Inhalte können in jeder Sprache
-- hochgeladen werden, z.B. Polnisch) — wird erst bei der KI-Anbindung
-- automatisch erkannt oder vom Nutzer gesetzt.
alter table cv_versions add column if not exists language text;
alter table job_analyses add column if not exists language text;