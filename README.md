# Nexus

Nexus este platforma de monitorizare si operare pentru infrastructura (dashboard, observability, tickets, NOC wall, chatbot).

## Tehnologii

- Frontend: React + Vite + MUI + Recharts
- API: Go
- Baza de date: PostgreSQL/TimescaleDB
- Orchestrare locala: Docker Compose

## Utilizare (Windows/macOS/Linux)

### Cerinte

- Docker Desktop (sau Docker Engine + Compose plugin)

### 1) Configureaza variabilele locale

Copie `.env` (sau creeaza unul nou) cu minim:

```env
COMPOSE_PROJECT_NAME=nexus
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nexus
POSTGRES_EXTERNAL_PORT=5433
DB_PORT=5432
SERVER_PORT=8080
API_EXTERNAL_PORT=8080
```

### 2) Porneste aplicatia

```bash
docker compose up -d --build
```

### 3) Verifica servicii

```bash
docker compose ps
```

### 4) Opreste aplicatia

```bash
docker compose down
```

### 5) Opreste + sterge si volumul DB (optional)

```bash
docker compose down -v
```

## Endpoint-uri uzuale

- API: `http://localhost:8080`
- PostgreSQL: `localhost:5433`
