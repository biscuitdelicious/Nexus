package model

import "time"

type Sensor struct {
	SensorID uint `gorm:"primaryKey"`
	LocationID uint `gorm:"not null"`
	Location Location `gorm:"foreignKey:LocationID"`
	UpdatedUserID uint `gorm:"not null"`
	User User `gorm:"foreignKey:UpdatedUserID"`
	SensorNo string `gorm:"unique"`
	Name string
	IsObsolete bool `gorm:"not null;default:false"`
	LowerLimit *float64 `gorm:"type:decimal(10, 2)"`
	UpperLimit *float64 `gorm:"type:decimal(10, 2)"`
	UpdatedDtm time.Time  `gorm:"not null;autoUpdateTime"`
}