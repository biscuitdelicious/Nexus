package model

import "time"

type User struct {
	UserID uint `gorm:"primaryKey"`
	FirstName string `gorm:"not null"`
	LastName string
	Email string `gorm:"not null;unique"`
	Role string `gorm:"not null"`
	PasswordHash string `gorm:"not null"`
	CreatedAt time.Time `gorm:"not null;autoCreateTime"`
	UpdatedDtm time.Time `gorm:"autoUpdateTime"`

}