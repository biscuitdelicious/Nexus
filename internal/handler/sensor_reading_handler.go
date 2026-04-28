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
// Body: { "sensor_id": 1, "value": 67.5, "host": "Victor" }
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

	limit := 60
	if limStr := r.URL.Query().Get("limit"); limStr != "" {
		if v, err := strconv.Atoi(limStr); err == nil && v > 0 && v <= 5000 {
			limit = v
		}
	}

	duration := parseRange(r.URL.Query().Get("range"))

	rows, err := h.repo.GetRecent(uint(sensorID), limit, duration)
	if err != nil {
		http.Error(w, "failed to fetch readings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

// parseRange converts a query param like "15m", "1h", "6h", "24h" into a time.Duration.
// Empty/invalid means no time filter (duration=0).
func parseRange(raw string) time.Duration {
	if raw == "" {
		return 0
	}
	d, err := time.ParseDuration(raw)
	if err != nil || d <= 0 {
		return 0
	}
	// Guardrails to prevent accidental huge scans.
	if d > 30*24*time.Hour {
		return 30 * 24 * time.Hour
	}
	return d
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
