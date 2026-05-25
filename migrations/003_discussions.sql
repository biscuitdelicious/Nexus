-- Forum-style threads tied to infra incidents (optional link to events alarm row).

CREATE TABLE IF NOT EXISTS discussions (
    discussion_id   SERIAL PRIMARY KEY,
    event_id        INTEGER REFERENCES events(event_id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'open',
    creator_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    author_display  TEXT NOT NULL,
    device_label    TEXT,
    body            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussion_comments (
    comment_id       SERIAL PRIMARY KEY,
    discussion_id    INTEGER NOT NULL REFERENCES discussions(discussion_id) ON DELETE CASCADE,
    user_id          INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    author_display   TEXT NOT NULL,
    message          TEXT NOT NULL,
    is_system        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS discussions_event_id_idx ON discussions(event_id);

CREATE INDEX IF NOT EXISTS discussions_status_created_idx
    ON discussions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS discussion_comments_discussion_created_idx
    ON discussion_comments(discussion_id, created_at);
