package model

import "time"

// Reading is a single time-series sample from a sensor.
// Stored in the `readings` hypertable. Append-only, high volume.
type Reading struct {
	Time     time.Time `gorm:"column:time;not null;autoCreateTime" json:"time"`
	SensorID uint      `gorm:"column:sensor_id;not null" json:"sensor_id"`
	Metric   string    `gorm:"column:metric;not null" json:"metric"`
	Value    float64   `gorm:"column:value;not null" json:"value"`
}

// TableName tells GORM this struct maps to `readings` (default would be `readings` anyway,
// but declaring it explicitly prevents surprises if naming conventions change later).
func (Reading) TableName() string {
	return "readings"
}
