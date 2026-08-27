-- Migration 0007: Avatar-Storage-Policies reparieren
--
-- Diagnose: Der Foto-Upload schlug live mit
--   {"statusCode":"403","error":"Unauthorized","message":"new row violates row-level security policy"}
-- fehl, obwohl der "avatars"-Bucket existiert. Die INSERT-Policy aus Migration
-- 0006 wurde offenbar nicht (vollständig) angelegt. Dieses Skript ist idempotent
-- (drop + recreate) und kann gefahrlos erneut ausgeführt werden, egal welcher
-- Teil von 0006 bereits durchgelaufen ist.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars-bucket: eigene Datei hochladen" on storage.objects;
drop policy if exists "avatars-bucket: eigene Datei ersetzen" on storage.objects;
drop policy if exists "avatars-bucket: eigene Datei löschen" on storage.objects;

create policy "avatars-bucket: eigene Datei hochladen"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars-bucket: eigene Datei ersetzen"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars-bucket: eigene Datei löschen"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);