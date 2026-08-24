-- Speichert den extrahierten Text eines hochgeladenen, bestehenden Lebenslaufs,
-- falls die Analyse darauf basiert (statt nur auf dem gespeicherten Profil).
-- Wird als zusätzliche Grundierungsquelle sowohl in /api/analyze als auch in
-- /api/cv/generate verwendet.
alter table job_analyses add column if not exists source_cv_text text;
