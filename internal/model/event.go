package model

import "time"

type Event struct {
	EventID uint `gorm:"primaryKey"`
	LocationID uint `gorm:"not null"`
	Location Location `gorm:"foreignKey:LocationID"`
	SensorID uint `gorm:"not null"`
	Sensor Sensor `gorm:"foreignKey:SensorID"`
	Severity string `gorm:"not null"`
	Status string `gorm:"default:'open';not null"`
	MetricValue float64 `gorm:"type:decimal(10, 2);not null"`
	Message string `gorm:"not null"`
	CreatedAt time.Time `gorm:"not null;autoCreateTime"`
	UpdatedAt *time.Time
	ResolvedAt *time.Time 


}