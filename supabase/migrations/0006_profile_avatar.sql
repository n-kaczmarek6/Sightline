-- Migration 0006: Profilbild
--
-- Eigener, öffentlicher Storage-Bucket für Profilbilder (im Gegensatz zum
-- privaten "documents"-Bucket): Fotos sind nicht sensibel wie Nachweis-
-- Dokumente und werden direkt als <img src> im UI sowie beim PDF/DOCX-Export
-- verwendet — eine öffentliche URL erspart dafür signierte URLs bei jedem
-- Request. Upload/Löschen bleibt trotzdem auf den eigenen Ordner beschränkt.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars-bucket: eigene Datei hochladen"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars-bucket: eigene Datei ersetzen"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars-bucket: eigene Datei löschen"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

alter table profiles add column if not exists avatar_url text;
