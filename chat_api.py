import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from chatbot import chat_nexus, memory_store

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
