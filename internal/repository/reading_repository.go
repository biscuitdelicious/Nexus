package repository

import (
	"time"

	"github.com/biscuitdelicious/Nexus/internal/model"
	"gorm.io/gorm"
)

type ReadingRepository struct {
	db *gorm.DB
}

func NewReadingRepository(db *gorm.DB) *ReadingRepository {
	return &ReadingRepository{db: db}
}

// GetBySensor returns readings for one sensor within the last `duration`.
// Optionally filter by metric name. Pass empty string to get all metrics.
func (r *ReadingRepository) GetBySensor(sensorID uint, duration time.Duration, metric string) ([]model.Reading, error) {
	var readings []model.Reading
	since := time.Now().Add(-duration)

	query := r.db.Where("sensor_id = ? AND time >= ?", sensorID, since)
	if metric != "" {
		query = query.Where("metric = ?", metric)
	}

	result := query.Order("time ASC").Find(&readings)
	return readings, result.Error
}

// MetricSummary is a single metric + its latest value.
type MetricSummary struct {
	Metric string    `json:"metric"`
	Value  float64   `json:"value"`
	Time   time.Time `json:"time"`
}

// LatestPerMetric returns the most recent reading for each metric across all sensors.
// Used by the dashboard cards — "CPU_LOAD: 87%" etc.
func (r *ReadingRepository) LatestPerMetric() ([]MetricSummary, error) {
	var summaries []MetricSummary

	// DISTINCT ON is a Postgres-specific trick: for each `metric`, return the row
	// with the highest `time`. Much faster than a self-join or window function.
	err := r.db.Raw(`
		SELECT DISTINCT ON (metric) metric, value, time
		FROM readings
		ORDER BY metric, time DESC
	`).Scan(&summaries).Error

	return summaries, err
}
