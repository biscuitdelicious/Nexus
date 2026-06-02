package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/biscuitdelicious/Nexus/config"
	"github.com/biscuitdelicious/Nexus/internal/handler"
	appmw "github.com/biscuitdelicious/Nexus/internal/middleware"
	"github.com/biscuitdelicious/Nexus/internal/repository"
	"github.com/biscuitdelicious/Nexus/migrations"
	"github.com/go-chi/chi/v5"
	"github.com/pressly/goose/v3"
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

	// Run DB migrations on startup so the schema is always current, regardless
	// of whether the postgres volume is fresh or pre-existing. Goose tracks
	// applied versions in goose_db_version and only runs new ones.
	if err := runMigrations(db); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	locationRepo := repository.NewLocationRepository(db)
	sensorRepo := repository.NewSensorRepository(db)
	userRepo := repository.NewUserRepository(db)
	eventRepo := repository.NewEventRepository(db)
	ackRepo := repository.NewAcknowledgementRepository(db)
	readingRepo := repository.NewReadingRepository(db)
	sensorReadingRepo := repository.NewSensorReadingRepository(db)

	locationHandler := handler.NewLocationHandler(locationRepo)
	sensorHandler := handler.NewSensorHandler(sensorRepo)
	userHandler := handler.NewUserHandler(userRepo)
	eventHandler := handler.NewEventHandler(eventRepo)
	ackHandler := handler.NewAcknowledgementHandler(ackRepo)
	webhookHandler := handler.NewWebhookHandler(eventRepo, sensorRepo)
	readingHandler := handler.NewReadingHandler(readingRepo)
	sensorReadingHandler := handler.NewSensorReadingHandler(sensorReadingRepo)

	r := chi.NewRouter()

	// Require a valid JWT (or the service token) on every route except /health.
	r.Use(appmw.Auth(cfg.JWTSecret, cfg.ServiceToken))

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
	r.Get("/sensors/{id}/readings", readingHandler.GetBySensor)

	r.Get("/metrics/summary", readingHandler.GetSummary)

	r.Get("/users", userHandler.GetAll)
	r.Get("/users/{id}", userHandler.GetByID)
	r.Post("/users", userHandler.Create)

	r.Get("/events", eventHandler.GetAll)
	r.Get("/events/open", eventHandler.GetOpen)
	r.Get("/events/frequency", eventHandler.Frequency)
	r.Get("/events/{id}", eventHandler.GetByID)
	r.Post("/events", eventHandler.Create)
	r.Patch("/events/{id}", eventHandler.UpdateStatus)
	r.Post("/events/{id}/snooze", eventHandler.Snooze)

	r.Get("/events/{eventId}/acknowledgements", ackHandler.GetByEventID)
	r.Post("/acknowledgements", ackHandler.Create)

	r.Post("/webhook/grafana", webhookHandler.HandleGrafana)

	r.Post("/readings", sensorReadingHandler.Create)
	r.Get("/readings", sensorReadingHandler.GetRecent)
	r.Get("/readings/latest", sensorReadingHandler.Latest)

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

// runMigrations applies pending goose migrations embedded in the binary.
func runMigrations(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	goose.SetBaseFS(migrations.FS)
	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}

	if err := goose.Up(sqlDB, "."); err != nil {
		return err
	}

	log.Println("migrations up to date")
	return nil
}
