-- Sightline — Migration 0002: Land als eigenes Feld
--
-- Bisher stand alles (Stadt + Land) in profiles.location als ein Textfeld.
-- Für ein Land-Dropdown in der UI trennen wir das: location bleibt die Stadt,
-- country ist neu und wird über ein <select> mit fester Länderliste gepflegt.

alter table profiles add column if not exists country text;
