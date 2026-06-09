package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/biscuitdelicious/Nexus/internal/model"
	"github.com/biscuitdelicious/Nexus/internal/repository"
)

type SensorReadingHandler struct {
	repo *repository.SensorReadingRepository
}

func NewSensorReadingHandler(repo *repository.SensorReadingRepository) *SensorReadingHandler {
	return &SensorReadingHandler{repo: repo}
}

// POST /readings
// Body: { "sensor_id": 1, "value": 67.5, "host": "Admin" }
func (h *SensorReadingHandler) Create(w http.ResponseWriter, r *http.Request) {
	var body struct {
		SensorID uint      `json:"sensor_id"`
		Value    float64   `json:"value"`
		Host     string    `json:"host"`
		Time     time.Time `json:"time"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if body.SensorID == 0 {
		http.Error(w, "sensor_id required", http.StatusBadRequest)
		return
	}

	reading := &model.SensorReading{
		SensorID: body.SensorID,
		Value:    body.Value,
		Host:     body.Host,
		Time:     body.Time,
	}
	if reading.Time.IsZero() {
		reading.Time = time.Now()
	}

	if err := h.repo.Create(reading); err != nil {
		http.Error(w, "failed to save reading", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(reading)
}

// GET /readings?sensor_id=1&limit=60&range=1h
func (h *SensorReadingHandler) GetRecent(w http.ResponseWriter, r *http.Request) {
	sensorIDStr := r.URL.Query().Get("sensor_id")
	if sensorIDStr == "" {
		http.Error(w, "sensor_id query param required", http.StatusBadRequest)
		return
	}
	sensorID, err := strconv.Atoi(sensorIDStr)
	if err != nil || sensorID <= 0 {
		http.Error(w, "invalid sensor_id", http.StatusBadRequest)
		return
	}

	duration := parseRange(r.URL.Query().Get("range"))

	// Scalable path: when max_points is set, downsample server-side with
	// time_bucket so the payload stays bounded regardless of raw row count.
	if mpStr := r.URL.Query().Get("max_points"); mpStr != "" {
		maxPoints := 300
		if v, err := strconv.Atoi(mpStr); err == nil && v > 0 && v <= 2000 {
			maxPoints = v
		}
		rows, err := h.repo.GetDownsampled(uint(sensorID), duration, maxPoints)
		if err != nil {
			http.Error(w, "failed to fetch readings", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(rows)
		return
	}

	// Legacy path: raw rows capped by limit (kept for backward compatibility).
	limit := 60
	if limStr := r.URL.Query().Get("limit"); limStr != "" {
		if v, err := strconv.Atoi(limStr); err == nil && v > 0 && v <= 5000 {
			limit = v
		}
	}

	rows, err := h.repo.GetRecent(uint(sensorID), limit, duration)
	if err != nil {
		http.Error(w, "failed to fetch readings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

// GET /readings/latest
// Returns latest reading per sensor (map keyed by sensor_id).
func (h *SensorReadingHandler) Latest(w http.ResponseWriter, r *http.Request) {
	latest, err := h.repo.LatestPerSensor()
	if err != nil {
		http.Error(w, "failed to fetch latest readings", http.StatusInternalServerError)
		return
	}

	out := make([]model.SensorReading, 0, len(latest))
	for _, v := range latest {
		out = append(out, v)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}
