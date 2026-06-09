-- Adds the snooze column used to temporarily hide an event/ticket.
-- NOTE: no rollback ("Down") statements here on purpose — this file is applied
-- by Postgres initdb (which runs the whole file), so a DROP block would undo
-- the column on a fresh database.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_events_snoozed_until
  ON events (snoozed_until)
  WHERE snoozed_until IS NOT NULL;
