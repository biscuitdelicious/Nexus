package repository

import (
	"github.com/biscuitdelicious/Nexus/internal/model"
	"gorm.io/gorm"
)

type SensorRepository struct {
	db *gorm.DB
}

func NewSensorRepository(db *gorm.DB) *SensorRepository {
	return &SensorRepository{db: db}
}

func (r *SensorRepository) GetAll() ([]model.Sensor, error) {
	var sensors []model.Sensor
	result := r.db.Preload("Location").Find(&sensors)
	return sensors, result.Error
}

func (r *SensorRepository) GetByID(id uint) (*model.Sensor, error) {
	var sensor model.Sensor
	result := r.db.First(&sensor, id)
	return &sensor, result.Error
}

func (r *SensorRepository) Create(sensor *model.Sensor) error {
	return r.db.Create(sensor).Error
}

func (r *SensorRepository) Update(sensor *model.Sensor) error {
	return r.db.Save(sensor).Error
}

func (r *SensorRepository) Delete(id uint) error {
	return r.db.Model(&model.Sensor{}).Where("sensor_id = ?", id).Update("is_obsolete", true).Error
}
