-- Time-series table for sensor readings.
-- High-volume, append-only. Stored as a TimescaleDB hypertable for fast range queries.
-- One row per metric sample. A single sensor can report multiple metrics

CREATE TABLE IF NOT EXISTS readings (
    time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sensor_id INTEGER NOT NULL REFERENCES sensors(sensor_id),
    metric    TEXT NOT NULL,
    value     DOUBLE PRECISION NOT NULL
);

-- Partitions by time automatically
SELECT create_hypertable('readings', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS readings_sensor_time_idx
    ON readings (sensor_id, time DESC);

CREATE INDEX IF NOT EXISTS readings_metric_time_idx
    ON readings (metric, time DESC);
