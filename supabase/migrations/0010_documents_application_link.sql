-- Verknüpft Dokumente (Evidence Vault) optional mit einer Bewerbung, analog zu
-- application_id bei cv_versions/job_analyses. Wird beim Löschen der Bewerbung
-- nicht mitgelöscht (set null) — das Dokument selbst bleibt erhalten.
alter table documents add column if not exists application_id uuid references applications(id) on delete set null;
