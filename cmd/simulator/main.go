package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
)

// Scalability note: the read path (GET /readings?sensor_id=&range=&max_points=)
// downsamples server-side with TimescaleDB time_bucket, so the frontend never
// pulls all rows — payload stays bounded (~max_points) regardless of table size.
// See SensorReadingRepository.GetDownsampled.


// Sensor describes one simulated metric channel.
type Sensor struct {
	ID       uint
	Name     string
	Baseline float64 // long-term mean (μ) the value reverts toward
	Theta    float64 // mean-reversion strength; higher = tighter band
	Sigma    float64 // noise amplitude per √dt
	Min      float64 // hard floor (clamped)
	Max      float64 // hard ceiling (clamped)
	current  float64
}

type readingPayload struct {
	SensorID uint    `json:"sensor_id"`
	Value    float64 `json:"value"`
	Host     string  `json:"host"`
}

func main() {
	apiURL := getenv("API_BASE_URL", "http://localhost:8080")
	intervalSec := getenvInt("INTERVAL_SEC", 5)
	serviceToken := os.Getenv("SERVICE_TOKEN")
	host, _ := os.Hostname()

	sensors := []*Sensor{
		{ID: 1, Name: "cpu_temp", Baseline: 55, Theta: 0.3, Sigma: 1.5, Min: 30, Max: 95},
		{ID: 2, Name: "cpu_load", Baseline: 35, Theta: 0.2, Sigma: 4.0, Min: 0, Max: 100},
		{ID: 3, Name: "memory_usage", Baseline: 65, Theta: 0.15, Sigma: 2.0, Min: 20, Max: 95},
	}
	for _, s := range sensors {
		s.current = s.Baseline
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	dt := float64(intervalSec)

	log.Printf("simulator started: api=%s interval=%ds sensors=%d", apiURL, intervalSec, len(sensors))

	ticker := time.NewTicker(time.Duration(intervalSec) * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		for _, s := range sensors {
			s.current = step(s, dt, rng)
			if err := post(apiURL, s, host, serviceToken); err != nil {
				log.Printf("post sensor %d (%s) failed: %v", s.ID, s.Name, err)
				continue
			}
			log.Printf("sensor %d (%s) → %.2f", s.ID, s.Name, s.current)
		}
	}
}

func step(s *Sensor, dt float64, rng *rand.Rand) float64 {
	drift := s.Theta * (s.Baseline - s.current) * dt
	shock := s.Sigma * math.Sqrt(dt) * rng.NormFloat64()
	next := s.current + drift + shock

	if next < s.Min {
		next = s.Min
	}
	if next > s.Max {
		next = s.Max
	}
	return next
}

func post(apiURL string, s *Sensor, host, serviceToken string) error {
	body, _ := json.Marshal(readingPayload{
		SensorID: s.ID,
		Value:    s.current,
		Host:     host,
	})
	req, err := http.NewRequest(http.MethodPost, apiURL+"/readings", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if serviceToken != "" {
		req.Header.Set("Authorization", "Bearer "+serviceToken)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("http %d", resp.StatusCode)
	}
	return nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getenvInt(key string, def int) int {
	v, err := strconv.Atoi(os.Getenv(key))
	if err != nil || v <= 0 {
		return def
	}
	return v
}
