package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/biscuitdelicious/Nexus/internal/model"
	"github.com/biscuitdelicious/Nexus/internal/repository"
)

type EventHandler struct {
	repo *repository.EventRepository
}

func NewEventHandler(repo *repository.EventRepository) *EventHandler {
	return &EventHandler{repo: repo}
}

func (h *EventHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	events, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, "failed to fetch events", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func (h *EventHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r, "id")
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	event, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "event not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// GetOpen returns all events that are still open or acknowledged (not resolved).
func (h *EventHandler) GetOpen(w http.ResponseWriter, r *http.Request) {
	events, err := h.repo.GetOpen()
	if err != nil {
		http.Error(w, "failed to fetch open events", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// UpdateStatus handles PATCH /events/{id}
// Body: { "status": "acknowledged" } or { "status": "resolved" }
func (h *EventHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r, "id")
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if body.Status != "acknowledged" && body.Status != "resolved" {
		http.Error(w, "status must be 'acknowledged' or 'resolved'", http.StatusBadRequest)
		return
	}

	event, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "event not found", http.StatusNotFound)
		return
	}

	now := time.Now()
	event.Status = body.Status
	event.UpdatedAt = &now
	if body.Status == "resolved" {
		event.ResolvedAt = &now
	}

	if err := h.repo.UpdateStatus(event); err != nil {
		http.Error(w, "failed to update event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// Frequency handles GET /events/frequency?range=1h&limit=10
// Returns top sensors by alarm count in window:
//   [{ "source": "cpu_temp", "sensor_id": 1, "count": 12 }, ...]
// Missing/invalid range defaults to 1h. limit defaults to 10, max 50.
func (h *EventHandler) Frequency(w http.ResponseWriter, r *http.Request) {
	d := parseRange(r.URL.Query().Get("range"))

	limit := 10
	if raw := r.URL.Query().Get("limit"); raw != "" {
		if v, err := strconv.Atoi(raw); err == nil && v > 0 && v <= 50 {
			limit = v
		}
	}

	rows, err := h.repo.FrequencyBySource(d, limit)
	if err != nil {
		http.Error(w, "failed to fetch alarm frequency", http.StatusInternalServerError)
		return
	}

	if rows == nil {
		rows = []repository.FrequencyRow{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func (h *EventHandler) Create(w http.ResponseWriter, r *http.Request) {
	var event model.Event
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(&event); err != nil {
		http.Error(w, "failed to create event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(event)
}

// Snooze handles POST /events/{id}/snooze with JSON body `{"duration":"1h"}`.
// duration uses Go time.ParseDuration format (15m, 1h, 8h, etc).
func (h *EventHandler) Snooze(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r, "id")
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var body struct {
		Duration string `json:"duration"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	d, err := time.ParseDuration(body.Duration)
	if err != nil || d <= 0 {
		http.Error(w, "invalid duration", http.StatusBadRequest)
		return
	}
	// Cap at 7 days to prevent runaway snoozes.
	if d > 7*24*time.Hour {
		d = 7 * 24 * time.Hour
	}

	until := time.Now().Add(d)
	if err := h.repo.Snooze(id, until); err != nil {
		http.Error(w, "failed to snooze event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"event_id":      id,
		"status":        "snoozed",
		"snoozed_until": until,
	})
}
