package repository

import (
	"github.com/biscuitdelicious/Nexus/internal/model"
	"gorm.io/gorm"
	"time"
)

type SensorReadingRepository struct {
	db *gorm.DB
}

func NewSensorReadingRepository(db *gorm.DB) *SensorReadingRepository {
	return &SensorReadingRepository{db: db}
}

func (r *SensorReadingRepository) Create(reading *model.SensorReading) error {
	return r.db.Create(reading).Error
}

// Latest N readings for a sensor, optionally limited to last duration. Returns rows oldest → newest (good for charts).
func (r *SensorReadingRepository) GetRecent(sensorID uint, limit int, duration time.Duration) ([]model.SensorReading, error) {
	var rows []model.SensorReading
	if limit <= 0 {
		limit = 60
	}

	q := r.db.Where("sensor_id = ?", sensorID)
	if duration > 0 {
		since := time.Now().Add(-duration)
		q = q.Where("time >= ?", since)
	}

	err := q.
		Order("time DESC").
		Limit(limit).
		Find(&rows).Error
	if err != nil {
		return nil, err
	}

	// Reverse so caller gets chronological order.
	for i, j := 0, len(rows)-1; i < j; i, j = i+1, j-1 {
		rows[i], rows[j] = rows[j], rows[i]
	}
	return rows, nil
}

// BucketPoint is one downsampled point: the average value over a time bucket.
type BucketPoint struct {
	Time  time.Time `json:"time"`
	Value float64   `json:"value"`
}

// GetDownsampled returns ~maxPoints averaged points spread across the whole `duration` window, using TimescaleDB time_bucket internal func
func (r *SensorReadingRepository) GetDownsampled(sensorID uint, duration time.Duration, maxPoints int) ([]BucketPoint, error) {
	if maxPoints <= 0 {
		maxPoints = 300
	}
	if duration <= 0 {
		duration = time.Hour
	}

	bucket := duration / time.Duration(maxPoints)
	if bucket < time.Second {
		bucket = time.Second
	}
	since := time.Now().Add(-duration)

	var rows []BucketPoint
	err := r.db.Raw(`
		SELECT time_bucket(make_interval(secs => ?), time) AS time,
		       avg(value)                                  AS value
		FROM sensor_readings
		WHERE sensor_id = ? AND time >= ?
		GROUP BY 1
		ORDER BY 1
	`, bucket.Seconds(), sensorID, since).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}

// Returns most recent reading per sensor.
func (r *SensorReadingRepository) LatestPerSensor() (map[uint]model.SensorReading, error) {
	var rows []model.SensorReading
	err := r.db.Raw(`
		SELECT DISTINCT ON (sensor_id) time, sensor_id, value, host
		FROM sensor_readings
		ORDER BY sensor_id, time DESC
	`).Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make(map[uint]model.SensorReading, len(rows))
	for _, r := range rows {
		out[r.SensorID] = r
	}
	return out, nil
}
