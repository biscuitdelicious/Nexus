package model


import "time"

type Acknowledgement struct {
	AcknowledgementID uint `gorm:"primaryKey"`
	EventID uint `gorm:"not null"`
	Event Event `gorm:"foreignKey:EventID"`
	UserID uint `gorm:"not null"`
	User User `gorm:"foreignKey:UserID"`
	Message string `gorm:"not null"`
	CreatedAt time.Time `gorm:"not null;autoCreateTime"`	
}