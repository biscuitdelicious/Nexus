package handler

import (
	"encoding/json"
	"net/http"

	"github.com/biscuitdelicious/Nexus/internal/model"
	"github.com/biscuitdelicious/Nexus/internal/repository"
)

type AcknowledgementHandler struct {
	repo *repository.AcknowledgementRepository
}

func NewAcknowledgementHandler(repo *repository.AcknowledgementRepository) *AcknowledgementHandler {
	return &AcknowledgementHandler{repo: repo}
}

// GetByEventID returns all acknowledgements for a given event.
func (h *AcknowledgementHandler) GetByEventID(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r, "eventId")
	if err != nil {
		http.Error(w, "invalid event id", http.StatusBadRequest)
		return
	}

	acks, err := h.repo.GetByEventID(id)
	if err != nil {
		http.Error(w, "failed to fetch acknowledgements", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(acks)
}

func (h *AcknowledgementHandler) Create(w http.ResponseWriter, r *http.Request) {
	var ack model.Acknowledgement
	if err := json.NewDecoder(r.Body).Decode(&ack); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(&ack); err != nil {
		http.Error(w, "failed to create acknowledgement", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ack)
}
