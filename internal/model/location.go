package model

type Location struct {
	LocationID uint `gorm:"primaryKey"`
	Name 	   string `gorm:"not null"`
    Description *string
	UpdatedUserID uint `gorm:"not null"`
	IsObsolete bool `gorm:"default:false"`
}