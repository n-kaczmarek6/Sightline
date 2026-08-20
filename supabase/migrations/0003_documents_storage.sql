-- Sightline — Migration 0003: Storage-Bucket für Dokumente
--
-- Die documents-Tabelle speichert nur Metadaten (Titel, Kategorie); die
-- eigentlichen Dateien liegen in Supabase Storage. Der Bucket ist privat
-- (public = false) — Dateien werden nur über kurzlebige Signed URLs
-- abgerufen, nie über eine öffentliche URL.
--
-- Jede Datei wird unter "<user_id>/<dateiname>" abgelegt. Die Policies
-- lesen dafür das erste Pfadsegment und vergleichen es mit auth.uid(),
-- damit jede:r Nutzer:in nur die eigenen Dateien sehen/hochladen/löschen kann.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents-bucket: eigene Dateien lesen"
  on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents-bucket: eigene Dateien hochladen"
  on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents-bucket: eigene Dateien löschen"
  on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
