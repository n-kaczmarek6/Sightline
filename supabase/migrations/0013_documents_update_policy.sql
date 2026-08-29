-- Migration 0013: Fehlende UPDATE-Policy im "documents"-Bucket ergänzen
--
-- Diagnose: Foto-Upload schlug mit RLS-Fehler fehl, sobald ein Nutzer sein
-- Profilbild ein zweites Mal auf denselben Storage-Pfad hochlud (z.B. immer
-- "<user_id>/avatar.png", wie es der Foto-Zuschneiden-Dialog jetzt konsequent
-- tut). storage.upload(..., { upsert: true }) führt in diesem Fall intern ein
-- UPDATE der bestehenden storage.objects-Zeile aus — Migration 0003 hat für
-- den "documents"-Bucket aber nur SELECT/INSERT/DELETE-Policies angelegt,
-- nie eine UPDATE-Policy. Vorher fiel das nicht auf, weil verschiedene
-- Uploads oft zufällig unterschiedliche Dateiendungen hatten (also neue
-- Pfade statt echter Überschreibungen).

create policy "documents-bucket: eigene Dateien ersetzen"
  on storage.objects for update
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
