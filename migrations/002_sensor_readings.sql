-- Time-series table for raw sensor readings (temperature, etc.)
-- One row per sample. Hypertable partitioned by time.

CREATE TABLE IF NOT EXISTS sensor_readings (
    time      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    sensor_id INTEGER          NOT NULL REFERENCES sensors(sensor_id),
    value     DOUBLE PRECISION NOT NULL,
    host      TEXT
);

SELECT create_hypertable('sensor_readings', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_time
    ON sensor_readings (sensor_id, time DESC);
