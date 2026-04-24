package repository

import (
	"github.com/biscuitdelicious/Nexus/internal/model"
	"gorm.io/gorm"
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

// Latest N readings for a sensor, oldest → newest (good for charts).
func (r *SensorReadingRepository) GetRecent(sensorID uint, limit int) ([]model.SensorReading, error) {
	var rows []model.SensorReading
	if limit <= 0 {
		limit = 60
	}

	err := r.db.
		Where("sensor_id = ?", sensorID).
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
