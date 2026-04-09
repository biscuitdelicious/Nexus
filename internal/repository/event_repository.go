package repository

import (
	"github.com/biscuitdelicious/Nexus/internal/model"
	"gorm.io/gorm"
)

type EventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) GetAll() ([]model.Event, error) {
	var events []model.Event
	result := r.db.Find(&events)
	return events, result.Error
}

func (r *EventRepository) GetByID(id uint) (*model.Event, error) {
	var event model.Event
	result := r.db.First(&event, id)
	return &event, result.Error
}

// Returns all events that have not been resolved
func (r *EventRepository) GetOpen() ([]model.Event, error) {
	var events []model.Event
	result := r.db.Where("status != ?", "resolved").Find(&events)
	return events, result.Error
}

func (r *EventRepository) Create(event *model.Event) error {
	return r.db.Create(event).Error
}

func (r *EventRepository) Update(event *model.Event) error {
	return r.db.Save(event).Error
}
