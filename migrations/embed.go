// Package migrations bundles the SQL migration files into the binary via
// go:embed, so the api container can run them on startup without needing the
// migrations directory mounted at runtime.
package migrations

import "embed"

// FS holds all *.sql migration files, consumed by goose in cmd/api.
//
//go:embed *.sql
var FS embed.FS
