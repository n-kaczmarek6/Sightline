-- Erlaubt "cv" als Dokument-Kategorie: jeder Lebenslauf-Export (PDF/DOCX) wird
-- ab jetzt zusätzlich als Dokument in der Evidence-Vault-Ablage gespeichert.
alter table documents drop constraint if exists documents_category_check;
alter table documents add constraint documents_category_check
  check (category in ('certificate', 'review', 'education', 'cv', 'other'));
