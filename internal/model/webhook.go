package model

import "time"

type GrafanaWebhook struct {
	Status string          `json:"status"` // "firing" or "resolved"
	Alerts []GrafanaAlert  `json:"alerts"`
}

type GrafanaAlert struct {
	Status      string            `json:"status"`      // "firing" or "resolved"
	Labels      map[string]string `json:"labels"`     
	Annotations map[string]string `json:"annotations"` // summary / description
	StartsAt    time.Time         `json:"startsAt"`
	Fingerprint string            `json:"fingerprint"` // unique ID for this alert rule + label set
}
