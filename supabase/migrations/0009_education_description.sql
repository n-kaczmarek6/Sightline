-- Freitext-Feld für Ausbildungseinträge, analog zu "bullets" bei work_experience:
-- Nutzer:innen beschreiben in eigenen Worten, was sie im Studium/der Ausbildung
-- gemacht haben (Schwerpunkte, Praxisprojekte, Abschlussarbeit etc.), daraus
-- schlägt die KI passende Skills aus der kuratierten Liste vor (/api/skills/suggest)
-- und die Analyse-/CV-Generierungs-Routen nutzen es als zusätzliche Grundierung.
alter table education add column if not exists description text;
