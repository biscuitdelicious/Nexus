-- +goose Up

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_events_snoozed_until
  ON events (snoozed_until)
  WHERE snoozed_until IS NOT NULL;

-- +goose Down
DROP INDEX IF EXISTS idx_events_snoozed_until;
ALTER TABLE events DROP COLUMN IF EXISTS snoozed_until;
