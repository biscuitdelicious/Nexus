package repository

import (
	"github.com/biscuitdelicious/Nexus/internal/model"
	"gorm.io/gorm"
)

type AcknowledgementRepository struct {
	db *gorm.DB
}

func NewAcknowledgementRepository(db *gorm.DB) *AcknowledgementRepository {
	return &AcknowledgementRepository{db: db}
}

// Returns all acknowledgements for a specific event
func (r *AcknowledgementRepository) GetByEventID(eventID uint) ([]model.Acknowledgement, error) {
	var acks []model.Acknowledgement
	result := r.db.Where("event_id = ?", eventID).Find(&acks)
	return acks, result.Error
}

func (r *AcknowledgementRepository) Create(ack *model.Acknowledgement) error {
	return r.db.Create(ack).Error
}
