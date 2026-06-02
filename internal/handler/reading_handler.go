package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/biscuitdelicious/Nexus/internal/repository"
)

type ReadingHandler struct {
	repo *repository.ReadingRepository
}

func NewReadingHandler(repo *repository.ReadingRepository) *ReadingHandler {
	return &ReadingHandler{repo: repo}
}

// GetBySensor handles GET /sensors/{id}/readings?range=1h&metric=cpu_load
// Returns time-series data for charting.
func (h *ReadingHandler) GetBySensor(w http.ResponseWriter, r *http.Request) {
	sensorID, err := parseID(r, "id")
	if err != nil {
		http.Error(w, "invalid sensor id", http.StatusBadRequest)
		return
	}

	duration := parseRange(r.URL.Query().Get("range"))
	metric := r.URL.Query().Get("metric")

	readings, err := h.repo.GetBySensor(sensorID, duration, metric)
	if err != nil {
		http.Error(w, "failed to fetch readings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(readings)
}

// GetSummary handles GET /metrics/summary
// Returns the latest value for each metric. Powers the dashboard stat cards.
func (h *ReadingHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.repo.LatestPerMetric()
	if err != nil {
		http.Error(w, "failed to fetch metric summary", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

// parseRange converts a query param like "1h", "30m", "24h", "7d" into a
// time.Duration. Defaults to 1 hour if missing or invalid. Go's ParseDuration
// has no day unit, so "<n>d" is handled explicitly.
func parseRange(raw string) time.Duration {
	if raw == "" {
		return time.Hour
	}
	if strings.HasSuffix(raw, "d") {
		if days, err := strconv.Atoi(strings.TrimSuffix(raw, "d")); err == nil && days > 0 {
			return time.Duration(days) * 24 * time.Hour
		}
		return time.Hour
	}
	d, err := time.ParseDuration(raw)
	if err != nil {
		return time.Hour
	}
	return d
}
