import asyncio
import json
import os
from collections import defaultdict
from contextlib import closing
from typing import Optional

import bcrypt
import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
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
        fallback = {**DB_CONFIG, "host": "127.0.0.1", "port": 5434}
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


class SignupRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)
    first_name: str = Field(..., min_length=1)
    last_name: str | None = None


@app.post("/signup", response_model=LoginResponse)
def signup(request: SignupRequest):
    email = request.email.lower().strip()
    password_hash = bcrypt.hashpw(
        request.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    with closing(_db_connect()) as conn:
        with conn.cursor() as curr:
            curr.execute("SELECT user_id FROM users WHERE email = %s", (email,))
            if curr.fetchone():
                raise HTTPException(status_code=409, detail="Email already registered")

            curr.execute(
                "INSERT INTO users (first_name, last_name, email, role, password_hash) "
                "VALUES (%s, %s, %s, %s, %s) RETURNING user_id",
                (request.first_name, request.last_name, email, "user", password_hash),
            )
            user_id = curr.fetchone()[0]
            conn.commit()

    return LoginResponse(
        user_id=user_id, email=email, role="user",
        first_name=request.first_name, last_name=request.last_name,
    )


# =========================================================================
# Discussions: REST + WebSocket for real-time comments
# =========================================================================

class DiscussionSummary(BaseModel):
    discussion_id: int
    title: str
    status: str
    author_display: str
    device_label: Optional[str] = None
    created_at: str
    comment_count: int


class CommentOut(BaseModel):
    comment_id: int
    discussion_id: int
    author_display: str
    message: str
    is_system: bool
    created_at: str


class DiscussionDetail(BaseModel):
    discussion_id: int
    title: str
    status: str
    author_display: str
    device_label: Optional[str] = None
    body: str
    created_at: str
    updated_at: str
    comments: list[CommentOut]


class NewDiscussionRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1)
    author_display: str = Field(..., min_length=1, max_length=80)
    device_label: Optional[str] = Field(None, max_length=80)
    user_id: Optional[int] = None


class NewCommentRequest(BaseModel):
    author_display: str = Field(..., min_length=1, max_length=80)
    message: str = Field(..., min_length=1)
    user_id: Optional[int] = None


class StatusChangeRequest(BaseModel):
    status: str = Field(..., pattern="^(OPEN|RESOLVED|open|resolved)$")
    author_display: str = Field(..., min_length=1, max_length=80)
    user_id: Optional[int] = None


def _iso(ts):
    return ts.isoformat() if ts else None


@app.get("/discussions", response_model=list[DiscussionSummary])
def list_discussions():
    with closing(_db_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT d.discussion_id, d.title, d.status, d.author_display, "
                "d.device_label, d.created_at, "
                "COALESCE(c.cnt, 0) AS comment_count "
                "FROM discussions d "
                "LEFT JOIN (SELECT discussion_id, COUNT(*) AS cnt "
                "           FROM discussion_comments GROUP BY discussion_id) c "
                "  ON c.discussion_id = d.discussion_id "
                "ORDER BY d.created_at DESC"
            )
            rows = cur.fetchall()

    return [
        DiscussionSummary(
            discussion_id=r[0], title=r[1], status=r[2],
            author_display=r[3], device_label=r[4],
            created_at=_iso(r[5]), comment_count=r[6],
        )
        for r in rows
    ]


@app.get("/discussions/{discussion_id}", response_model=DiscussionDetail)
def get_discussion(discussion_id: int):
    with closing(_db_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT discussion_id, title, status, author_display, "
                "device_label, body, created_at, updated_at "
                "FROM discussions WHERE discussion_id = %s",
                (discussion_id,),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Discussion not found")

            cur.execute(
                "SELECT comment_id, discussion_id, author_display, message, "
                "is_system, created_at "
                "FROM discussion_comments WHERE discussion_id = %s "
                "ORDER BY created_at ASC",
                (discussion_id,),
            )
            comment_rows = cur.fetchall()

    return DiscussionDetail(
        discussion_id=row[0], title=row[1], status=row[2],
        author_display=row[3], device_label=row[4], body=row[5],
        created_at=_iso(row[6]), updated_at=_iso(row[7]),
        comments=[
            CommentOut(
                comment_id=c[0], discussion_id=c[1], author_display=c[2],
                message=c[3], is_system=c[4], created_at=_iso(c[5]),
            )
            for c in comment_rows
        ],
    )


@app.post("/discussions", response_model=DiscussionDetail)
def create_discussion(req: NewDiscussionRequest):
    with closing(_db_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO discussions (title, status, author_display, "
                "device_label, body, creator_user_id) "
                "VALUES (%s, %s, %s, %s, %s, %s) RETURNING discussion_id",
                (req.title, "OPEN", req.author_display,
                 req.device_label, req.body, req.user_id),
            )
            did = cur.fetchone()[0]
            conn.commit()
    return get_discussion(did)


@app.post("/discussions/{discussion_id}/comments", response_model=CommentOut)
async def add_comment(discussion_id: int, req: NewCommentRequest):
    with closing(_db_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO discussion_comments (discussion_id, user_id, "
                "author_display, message, is_system) "
                "VALUES (%s, %s, %s, %s, FALSE) "
                "RETURNING comment_id, discussion_id, author_display, "
                "message, is_system, created_at",
                (discussion_id, req.user_id, req.author_display, req.message),
            )
            row = cur.fetchone()
            cur.execute(
                "UPDATE discussions SET updated_at = NOW() "
                "WHERE discussion_id = %s",
                (discussion_id,),
            )
            conn.commit()

    comment = CommentOut(
        comment_id=row[0], discussion_id=row[1], author_display=row[2],
        message=row[3], is_system=row[4], created_at=_iso(row[5]),
    )
    await manager.broadcast(
        discussion_id,
        {"type": "comment", "data": comment.model_dump()},
    )
    return comment


@app.patch("/discussions/{discussion_id}/status")
async def change_status(discussion_id: int, req: StatusChangeRequest):
    new_status = req.status.upper()

    with closing(_db_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE discussions SET status = %s, updated_at = NOW() "
                "WHERE discussion_id = %s RETURNING discussion_id",
                (new_status, discussion_id),
            )
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Discussion not found")

            cur.execute(
                "INSERT INTO discussion_comments (discussion_id, user_id, "
                "author_display, message, is_system) "
                "VALUES (%s, %s, 'NEXUS_SYSTEM', %s, TRUE) "
                "RETURNING comment_id, discussion_id, author_display, "
                "message, is_system, created_at",
                (
                    discussion_id,
                    req.user_id,
                    f"Incident status changed to {new_status} by [{req.author_display}].",
                ),
            )
            sys_row = cur.fetchone()
            conn.commit()

    sys_comment = CommentOut(
        comment_id=sys_row[0], discussion_id=sys_row[1],
        author_display=sys_row[2], message=sys_row[3],
        is_system=sys_row[4], created_at=_iso(sys_row[5]),
    )
    await manager.broadcast(discussion_id, {
        "type": "status",
        "data": {"discussion_id": discussion_id, "status": new_status},
    })
    await manager.broadcast(discussion_id, {
        "type": "comment", "data": sys_comment.model_dump(),
    })
    return {"discussion_id": discussion_id, "status": new_status}


# ---- WebSocket connection manager ----------------------------------------

class _WSManager:
    def __init__(self):
        self.subs: dict[int, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def connect(self, discussion_id: int, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self.subs[discussion_id].add(ws)

    async def disconnect(self, discussion_id: int, ws: WebSocket):
        async with self._lock:
            self.subs[discussion_id].discard(ws)
            if not self.subs[discussion_id]:
                self.subs.pop(discussion_id, None)

    async def broadcast(self, discussion_id: int, payload: dict):
        msg = json.dumps(payload, default=str)
        async with self._lock:
            targets = list(self.subs.get(discussion_id, ()))
        dead = []
        for ws in targets:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(discussion_id, ws)


manager = _WSManager()


# =========================================================================
# Metrics: computed from events table (replaces frontend mocks)
# =========================================================================

class ObservabilityMetric(BaseModel):
    id: int
    label: str
    value: str
    sublabel: str


class ResolutionPoint(BaseModel):
    day: str
    time: float  # average minutes-to-resolve for that day


@app.get("/metrics/observability", response_model=list[ObservabilityMetric])
def metrics_observability():
    """Real metrics computed from events:
       - UPTIME = time since first event in DB (capped 30d)
       - ERROR RATE = critical/incident events in last 24h / total in last 24h
    """
    with closing(_db_connect()) as conn:
        with conn.cursor() as cur:
            # Uptime
            cur.execute("SELECT MIN(created_at) FROM events")
            first_event = cur.fetchone()[0]

            # Error rate last 24h
            cur.execute(
                "SELECT "
                "  COUNT(*) FILTER (WHERE LOWER(severity) IN ('critical', 'incident')) AS errors, "
                "  COUNT(*) AS total "
                "FROM events "
                "WHERE created_at >= NOW() - INTERVAL '24 hours'"
            )
            errors, total = cur.fetchone()

    # Format uptime
    if first_event is None:
        uptime_str = "N/A"
        sub_uptime = "No data yet"
    else:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        delta = now - first_event
        days = delta.days
        hours = (delta.seconds // 3600)
        mins = (delta.seconds % 3600) // 60
        if days > 0:
            uptime_str = f"{days}d {hours}h"
        elif hours > 0:
            uptime_str = f"{hours}h {mins}m"
        else:
            uptime_str = f"{mins}m"
        sub_uptime = f"Since {first_event.strftime('%Y-%m-%d')}"

    # Format error rate
    if total and total > 0:
        rate = (errors / total) * 100
        if rate < 1:
            err_str = "<1%"
        else:
            err_str = f"{rate:.1f}%"
        sub_err = f"{errors}/{total} events"
    else:
        err_str = "0%"
        sub_err = "No events 24h"

    return [
        ObservabilityMetric(id=1, label="UPTIME", value=uptime_str, sublabel=sub_uptime),
        ObservabilityMetric(id=2, label="ERROR RATE", value=err_str, sublabel=sub_err),
    ]


@app.get("/metrics/resolution", response_model=list[ResolutionPoint])
def metrics_resolution():
    """Average minutes-to-resolve per day, last 7 days.
       Uses events.resolved_at - events.created_at for events with status='resolved'.
    """
    with closing(_db_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT "
                "  TO_CHAR(date_trunc('day', resolved_at), 'Dy') AS day, "
                "  date_trunc('day', resolved_at) AS d, "
                "  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60.0) AS avg_min "
                "FROM events "
                "WHERE resolved_at IS NOT NULL "
                "  AND resolved_at >= NOW() - INTERVAL '7 days' "
                "GROUP BY d, day "
                "ORDER BY d ASC"
            )
            rows = cur.fetchall()

    return [
        ResolutionPoint(day=r[0].strip(), time=float(r[2] or 0))
        for r in rows
    ]


@app.websocket("/ws/discussions/{discussion_id}")
async def ws_discussion(websocket: WebSocket, discussion_id: int):
    await manager.connect(discussion_id, websocket)
    try:
        await websocket.send_text(json.dumps({"type": "hello",
                                              "discussion_id": discussion_id}))
        while True:
            # Keep connection alive; client may ping but we ignore content
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(discussion_id, websocket)
