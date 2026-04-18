package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/biscuitdelicious/Nexus/internal/model"
	"github.com/biscuitdelicious/Nexus/internal/repository"
	"gorm.io/gorm"
)

type WebhookHandler struct {
	eventRepo  *repository.EventRepository
	sensorRepo *repository.SensorRepository
}

func NewWebhookHandler(eventRepo *repository.EventRepository, sensorRepo *repository.SensorRepository) *WebhookHandler {
	return &WebhookHandler{eventRepo: eventRepo, sensorRepo: sensorRepo}
}

func (h *WebhookHandler) HandleGrafana(w http.ResponseWriter, r *http.Request) {
	var payload model.GrafanaWebhook
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	for _, alert := range payload.Alerts {
		if alert.Status != "firing" {
			continue
		}

		sensorID, err := parseSensorID(alert.Labels["sensor_id"])
		if err != nil {
			log.Printf("webhook: skipping alert, missing or invalid sensor_id label: %v", alert.Labels)
			continue
		}

		severity := mapSeverity(alert.Labels["severity"])
		message := alert.Annotations["summary"]
		if message == "" {
			message = alert.Annotations["description"]
		}

		sensor, err := h.sensorRepo.GetByID(sensorID)
		if err != nil {
			log.Printf("webhook: sensor %d not found, skipping alert", sensorID)
			continue
		}

		// Skip if sensor + severity is already there
		existing, err := h.eventRepo.FindOpenBySensor(sensorID, severity)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("webhook: checking for duplicate event: %v", err)
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}
		if existing != nil {
			log.Printf("webhook: duplicate event for sensor %d severity %s, moving on", sensorID, severity)
			continue
		}

		event := &model.Event{
			SensorID:    sensorID,
			LocationID:  sensor.LocationID,
			Severity:    severity,
			Status:      "open",
			MetricValue: 0,
			Message:     message,
		}

		if err := h.eventRepo.Create(event); err != nil {
			log.Printf("webhook: failed to create event for sensor %d: %v", sensorID, err)
			http.Error(w, "failed to create event", http.StatusInternalServerError)
			return
		}

		log.Printf("webhook: created event %d for sensor %d (%s)", event.EventID, sensorID, severity)
	}

	w.WriteHeader(http.StatusNoContent)
}

// Re-naming the severity by our standards
func mapSeverity(grafanaSeverity string) string {
	switch grafanaSeverity {
	case "critical":
		return "incident"
	case "warning":
		return "alarm"
	default:
		return "notification"
	}
}

// Reads the sensor_id label from the Grafana alert and converts it to uint
func parseSensorID(raw string) (uint, error) {
	if raw == "" {
		return 0, errors.New("sensor_id label is empty")
	}
	id, err := strconv.Atoi(raw)
	if err != nil || id <= 0 {
		return 0, errors.New("sensor_id label is not a valid positive integer")
	}
	return uint(id), nil
}
