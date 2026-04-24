package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/biscuitdelicious/Nexus/config"
	"github.com/biscuitdelicious/Nexus/internal/handler"
	"github.com/biscuitdelicious/Nexus/internal/repository"
	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	log.Println("connected to database")

	locationRepo := repository.NewLocationRepository(db)
	sensorRepo := repository.NewSensorRepository(db)
	userRepo := repository.NewUserRepository(db)
	eventRepo := repository.NewEventRepository(db)
	ackRepo := repository.NewAcknowledgementRepository(db)
	readingRepo := repository.NewSensorReadingRepository(db)

	locationHandler := handler.NewLocationHandler(locationRepo)
	sensorHandler := handler.NewSensorHandler(sensorRepo)
	userHandler := handler.NewUserHandler(userRepo)
	eventHandler := handler.NewEventHandler(eventRepo)
	ackHandler := handler.NewAcknowledgementHandler(ackRepo)
	webhookHandler := handler.NewWebhookHandler(eventRepo, sensorRepo)
	readingHandler := handler.NewSensorReadingHandler(readingRepo)

	r := chi.NewRouter()

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok"}`))
	})

	r.Get("/locations", locationHandler.GetAll)
	r.Get("/locations/{id}", locationHandler.GetByID)
	r.Post("/locations", locationHandler.Create)

	r.Get("/sensors", sensorHandler.GetAll)
	r.Get("/sensors/{id}", sensorHandler.GetByID)
	r.Post("/sensors", sensorHandler.Create)

	r.Get("/users", userHandler.GetAll)
	r.Get("/users/{id}", userHandler.GetByID)
	r.Post("/users", userHandler.Create)

	r.Get("/events", eventHandler.GetAll)
	r.Get("/events/open", eventHandler.GetOpen)
	r.Get("/events/{id}", eventHandler.GetByID)
	r.Post("/events", eventHandler.Create)
	r.Patch("/events/{id}", eventHandler.UpdateStatus)

	r.Get("/events/{eventId}/acknowledgements", ackHandler.GetByEventID)
	r.Post("/acknowledgements", ackHandler.Create)

	r.Post("/webhook/grafana", webhookHandler.HandleGrafana)

	r.Post("/readings", readingHandler.Create)
	r.Get("/readings", readingHandler.GetRecent)
	r.Get("/readings/latest", readingHandler.Latest)

	// Allow React to call this API
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	log.Printf("server starting on port %s", cfg.ServerPort)
	if err := http.ListenAndServe(":"+cfg.ServerPort, c.Handler(r)); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
