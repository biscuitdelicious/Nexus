package repository

import (
	"time"

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

// Returns events that are not resolved AND not currently snoozed.
// A snoozed event reappears automatically when `snoozed_until` is in the past.
func (r *EventRepository) GetOpen() ([]model.Event, error) {
	var events []model.Event
	result := r.db.
		Where("status != ?", "resolved").
		Where("(status != 'snoozed' OR snoozed_until IS NULL OR snoozed_until <= NOW())").
		Find(&events)
	return events, result.Error
}

// Snooze marks event as snoozed until the given time.
func (r *EventRepository) Snooze(eventID uint, until time.Time) error {
	return r.db.Model(&model.Event{}).
		Where("event_id = ?", eventID).
		Updates(map[string]interface{}{
			"status":         "snoozed",
			"snoozed_until":  until,
			"updated_at":     time.Now(),
		}).Error
}

func (r *EventRepository) Create(event *model.Event) error {
	return r.db.Create(event).Error
}

func (r *EventRepository) Update(event *model.Event) error {
	return r.db.Save(event).Error
}

// Changes only the status fields of an event
func (r *EventRepository) UpdateStatus(event *model.Event) error {
	return r.db.Model(event).Updates(map[string]interface{}{
		"status":      event.Status,
		"updated_at":  event.UpdatedAt,
		"resolved_at": event.ResolvedAt,
	}).Error
}

// FrequencyRow is one row in alarm-frequency breakdown.
type FrequencyRow struct {
	Source   string `json:"source"`
	SensorID uint   `json:"sensor_id"`
	Count    int64  `json:"count"`
}

// FrequencyBySource returns top `limit` sensors by event count in last `d` duration.
// Pass d=0 for all-time. Joins events → sensors to get human-readable name.
func (r *EventRepository) FrequencyBySource(d time.Duration, limit int) ([]FrequencyRow, error) {
	if limit <= 0 {
		limit = 10
	}

	var rows []FrequencyRow
	q := r.db.Table("events AS e").
		Select("s.name AS source, e.sensor_id, COUNT(*) AS count").
		Joins("JOIN sensors s ON s.sensor_id = e.sensor_id").
		Group("s.name, e.sensor_id").
		Order("count DESC").
		Limit(limit)

	if d > 0 {
		q = q.Where("e.created_at > ?", time.Now().Add(-d))
	}

	err := q.Scan(&rows).Error
	return rows, err
}

// Avoids duplicate events
func (r *EventRepository) FindOpenBySensor(sensorID uint, severity string) (*model.Event, error) {
	var event model.Event
	result := r.db.
		Where("sensor_id = ? AND severity = ? AND status != ?", sensorID, severity, "resolved").
		First(&event)
	if result.Error != nil {
		return nil, result.Error
	}
	return &event, nil
}