-- Initial schema for Infra Pulse
-- Auto-loaded by the postgres container on first start (mounted to /docker-entrypoint-initdb.d)

CREATE TABLE IF NOT EXISTS locations (
    location_id     SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    updated_user_id INTEGER NOT NULL,
    is_obsolete     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    first_name    TEXT NOT NULL,
    last_name     TEXT,
    email         TEXT NOT NULL UNIQUE,
    role          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_dtm   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensors (
    sensor_id       SERIAL PRIMARY KEY,
    location_id     INTEGER NOT NULL REFERENCES locations(location_id),
    updated_user_id INTEGER NOT NULL REFERENCES users(user_id),
    sensor_no       TEXT UNIQUE,
    name            TEXT,
    is_obsolete     BOOLEAN NOT NULL DEFAULT FALSE,
    lower_limit     DECIMAL(10, 2),
    upper_limit     DECIMAL(10, 2),
    updated_dtm     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    event_id     SERIAL PRIMARY KEY,
    location_id  INTEGER NOT NULL REFERENCES locations(location_id),
    sensor_id    INTEGER NOT NULL REFERENCES sensors(sensor_id),
    severity     TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'open',
    metric_value DECIMAL(10, 2) NOT NULL,
    message      TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ,
    resolved_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS acknowledgements (
    acknowledgement_id SERIAL PRIMARY KEY,
    event_id           INTEGER NOT NULL REFERENCES events(event_id),
    user_id            INTEGER NOT NULL REFERENCES users(user_id),
    message            TEXT NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed data so the API is usable right after spin-up
INSERT INTO users (first_name, last_name, email, role, password_hash)
VALUES ('Admin', 'User', 'admin@infrapulse.com', 'admin', 'placeholder_hash')
ON CONFLICT (email) DO NOTHING;

INSERT INTO locations (name, description, updated_user_id, is_obsolete)
VALUES
  ('Server Room A', 'Main datacenter floor 1', 1, false),
  ('Network Rack B', 'Core network equipment',  1, false),
  ('Security Zone C', 'Firewall and perimeter', 1, false)
ON CONFLICT DO NOTHING;

INSERT INTO sensors (location_id, sensor_no, name, is_obsolete, lower_limit, upper_limit, updated_user_id)
VALUES
  (1, 'SN-001', 'CPU Monitor',    false, 0, 95,  1),
  (1, 'SN-002', 'Memory Monitor', false, 0, 90,  1),
  (1, 'SN-003', 'Disk I/O',       false, 0, 85,  1),
  (2, 'SN-004', 'Core Router',    false, 0, 100, 1),
  (2, 'SN-005', 'Switch Rack B',  false, 0, 100, 1),
  (3, 'SN-006', 'Firewall Main',  false, 0, 100, 1)
ON CONFLICT (sensor_no) DO NOTHING;
