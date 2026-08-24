-- Sightline — Migration 0004: Sprachen als eigenes Profilfeld
--
-- Sprachen sind konzeptionell keine normalen Skills (eigener Abschnitt auf
-- jedem echten Lebenslauf) und bekommen deshalb ein eigenes Array-Feld,
-- analog zu target_roles/target_locations.

alter table profiles add column if not exists languages text[] default '{}';
