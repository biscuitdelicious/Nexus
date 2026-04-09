package repository

import (
	"github.com/biscuitdelicious/Nexus/internal/model"
	"gorm.io/gorm"
)

type LocationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) *LocationRepository {
	return &LocationRepository{db: db}
}

func (r *LocationRepository) GetAll() ([]model.Location, error) {
	var locations []model.Location
	result := r.db.Find(&locations)
	return locations, result.Error
}

func (r *LocationRepository) GetByID(id uint) (*model.Location, error) {
	var location model.Location
	result := r.db.First(&location, id)
	return &location, result.Error
}

func (r *LocationRepository) Create(location *model.Location) error {
	return r.db.Create(location).Error
}

func (r *LocationRepository) Update(location *model.Location) error {
	return r.db.Save(location).Error
}

func (r *LocationRepository) Delete(id uint) error {
	return r.db.Model(&model.Location{}).Where("location_id = ?", id).Update("is_obsolete", true).Error
}
