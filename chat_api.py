import os
from contextlib import closing

import bcrypt
import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from chatbot import chat_nexus, memory_store

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "nexus"),
    "user":     os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "postgres"),
    "port":     int(os.getenv("DB_PORT", "5433")),
}

def _db_connect():
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception:
        fallback = {**DB_CONFIG, "host": "127.0.0.1", "port": 5433}
        return psycopg2.connect(**fallback)

load_dotenv()

app = FastAPI(title="Nexus Chat API", version="1.0.0")

allowed_origins_raw = os.getenv(
    "CHAT_API_CORS_ORIGINS",
    (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:8080,http://127.0.0.1:8080"
    ),
)
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt")
    session_id: str = Field("default", min_length=1, description="Conversation session ID")


class ChatResponse(BaseModel):
    session_id: str
    response: str


class ResetSessionRequest(BaseModel):
    session_id: str = Field(..., min_length=1)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    answer = chat_nexus(request.prompt, session_id=request.session_id)
    return ChatResponse(session_id=request.session_id, response=answer)


@app.post("/chat/reset")
def reset_session(request: ResetSessionRequest):
    memory_store.clear(request.session_id)
    return {"status": "reset", "session_id": request.session_id}


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    user_id: int
    email: str
    role: str
    first_name: str
    last_name: str | None = None


@app.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    with closing(_db_connect()) as conn:
        with conn.cursor() as curr:
            curr.execute(
                "SELECT user_id, email, role, first_name, last_name, password_hash "
                "FROM users WHERE email = %s",
                (request.email.lower().strip(),),
            )
            row = curr.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, email, role, first_name, last_name, password_hash = row

    try:
        ok = bcrypt.checkpw(request.password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        ok = False

    if not ok:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return LoginResponse(
        user_id=user_id, email=email, role=role,
        first_name=first_name, last_name=last_name,
    )
