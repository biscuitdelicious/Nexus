# 🚀 Nexus - Quick Start Guide

Nexus este o platformă integrată de monitorizare și operare (Dashboard, Observability, AI Chatbot). Acest ghid te va ajuta să pornești proiectul local în doar câteva minute.

---

## 📋 Condiții minime (Prerequisites)

Înainte de a începe, asigură-te că ai următoarele instalate pe sistemul tău:

- **Docker Desktop** (pentru baza de date)
- **Node.js** (pentru Frontend/Vite)
- **Python 3.10+** (pentru AI Chatbot & API)

---

## 🛠️ 1. Instalare (Setup inițial)

Deschide un terminal în folderul rădăcină al proiectului și rulează următoarele comenzi:

### A) Pentru Partea de AI & Backend (Python)

```powershell
py -m pip install -r requirements.txt
```

### B) Pentru Interfață (Frontend - React/Vite)

```powershell
npm install
```

---

## 🔑 2. Configurare variabile locale (.env)

Creează un fișier numit `.env` în folderul principal al proiectului și adaugă următoarele linii (înlocuiește cheia OpenAI cu a ta):

```env
# AI Configuration
OPENAI_API_KEY=sk-introdu-cheia-ta-aici

# Database Configuration (Docker)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nexus
POSTGRES_EXTERNAL_PORT=5433
```

---

## 🚀 3. Pornirea Sistemului (Ordinea pașilor)

Pentru ca totul să funcționeze corect, pornește serviciile exact în această ordine:

### Pasul A: Baza de date (Docker)

Lansează containerele pentru PostgreSQL și TimescaleDB:

```bash
docker compose up -d
```

> Notă: Așteaptă aproximativ 10 secunde ca baza de date să fie complet gata înainte de pasul următor.

### Pasul B: Serverul AI (Chatbot)

Pornește „creierul” proiectului care interoghează baza de date:

```powershell
py chatbot_automat.py
```

### Pasul C: Interfața Vizuală (Frontend)

Pornește aplicația web în modul de dezvoltare:

```powershell
npm run dev
```

---

## 📍 Endpoint-uri uzuale

- API: `http://localhost:8080`
- PostgreSQL: `localhost:5433`

---

## 🧹 Oprește serviciile

```bash
docker compose down
```

### Oprește și șterge volumul DB (optional)

```bash
docker compose down -v
```
