package model

import "time"

type SensorReading struct {
	Time     time.Time `gorm:"column:time;not null;autoCreateTime" json:"time"`
	SensorID uint      `gorm:"column:sensor_id;not null" json:"sensor_id"`
	Value    float64   `gorm:"column:value;not null" json:"value"`
	Host     string    `gorm:"column:host" json:"host"`
}

func (SensorReading) TableName() string {
	return "sensor_readings"
}
