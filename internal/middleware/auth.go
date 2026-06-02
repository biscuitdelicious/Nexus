// Package middleware holds HTTP middleware for the API.
package middleware

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// publicPaths are reachable without authentication.
var publicPaths = map[string]bool{
	"/health": true,
}

// Auth returns middleware that requires a valid Bearer JWT (signed with
// jwtSecret) or the shared serviceToken on every request. Public paths and
// CORS preflight (OPTIONS) are exempt.
func Auth(jwtSecret, serviceToken string) func(http.Handler) http.Handler {
	secret := []byte(jwtSecret)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodOptions || publicPaths[r.URL.Path] {
				next.ServeHTTP(w, r)
				return
			}

			token := bearerToken(r)
			if token == "" || !validToken(token, secret, serviceToken) {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func bearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if len(h) > 7 && strings.EqualFold(h[:7], "bearer ") {
		return h[7:]
	}
	return ""
}

func validToken(token string, secret []byte, serviceToken string) bool {
	if serviceToken != "" && token == serviceToken {
		return true
	}
	parsed, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return secret, nil
	})
	return err == nil && parsed.Valid
}
