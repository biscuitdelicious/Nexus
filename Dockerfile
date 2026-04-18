# Multi-stage build: compile in one image, run in a smaller one.
# Stage 1: build the Go binary
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/api ./cmd/api

# Stage 2: minimal runtime image
FROM alpine:3.20

# ca-certificates needed if API ever makes outbound HTTPS calls
RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY --from=builder /app/bin/api /app/api

EXPOSE 8080

CMD ["/app/api"]
