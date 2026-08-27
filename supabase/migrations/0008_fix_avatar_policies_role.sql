-- Migration 0008: "to authenticated" aus den Avatar-Policies entfernen
--
-- Root cause gefunden (isoliert per direktem Node-Test außerhalb der App):
-- Derselbe Nutzer, derselbe Pfad ("<user_id>/datei") ließ sich problemlos in
-- den "documents"-Bucket hochladen, aber nicht in "avatars" — der einzige
-- Unterschied war "to authenticated" in Migration 0007. Supabase Storage
-- verbindet sich intern nicht als der Postgres-Rollenname "authenticated";
-- RLS-Policies für Storage müssen daher ohne "to"-Einschränkung (default:
-- public) geschrieben werden und sich rein auf auth.uid()/auth.role()
-- verlassen — genau das Muster, das der "documents"-Bucket in Migration 0003
-- schon immer nutzt.

drop policy if exists "avatars-bucket: eigene Datei hochladen" on storage.objects;
drop policy if exists "avatars-bucket: eigene Datei ersetzen" on storage.objects;
drop policy if exists "avatars-bucket: eigene Datei löschen" on storage.objects;

create policy "avatars-bucket: eigene Datei hochladen"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars-bucket: eigene Datei ersetzen"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars-bucket: eigene Datei löschen"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
