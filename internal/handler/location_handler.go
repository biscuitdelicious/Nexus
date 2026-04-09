package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/biscuitdelicious/Nexus/internal/model"
	"github.com/biscuitdelicious/Nexus/internal/repository"
	"github.com/go-chi/chi/v5"
)

type LocationHandler struct {
	repo *repository.LocationRepository
}

func NewLocationHandler(repo *repository.LocationRepository) *LocationHandler {
	return &LocationHandler{repo: repo}
}

func (h *LocationHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	locations, err := h.repo.GetAll()
	if err != nil {
		http.Error(w, "failed to fetch locations", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(locations)
}

func (h *LocationHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r, "id")
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	location, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "location not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(location)
}

func (h *LocationHandler) Create(w http.ResponseWriter, r *http.Request) {
	var location model.Location
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.repo.Create(&location); err != nil {
		http.Error(w, "failed to create location", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(location)
}

// parseID is a small helper used by all handlers to avoid repeating this logic.
func parseID(r *http.Request, param string) (uint, error) {
	val := chi.URLParam(r, param)
	id, err := strconv.Atoi(val)
	return uint(id), err
}
