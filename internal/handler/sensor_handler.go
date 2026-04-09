package handler

import (
	"encoding/json"
	"net/http"

	"github.com/biscuitdelicious/Nexus/internal/model"
	"github.com/biscuitdelicious/Nexus/internal/repository"
)

type SensorHandler struct {
	repo *repository.SensorRepository
}

func NewSensorHandler(repo *repository.SensorRepository) *SensorHandler {
	return &SensorHandler{repo: repo}
}

func (h *SensorHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	sensors, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, "failed to fetch sensors", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sensors)
}

func (h *SensorHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r, "id")
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	sensor, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "sensor not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sensor)
}

func (h *SensorHandler) Create(w http.ResponseWriter, r *http.Request) {
	var sensor model.Sensor
	if err := json.NewDecoder(r.Body).Decode(&sensor); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(&sensor); err != nil {
		http.Error(w, "failed to create sensor", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sensor)
}
