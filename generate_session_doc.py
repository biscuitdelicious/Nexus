"""Generate a full session documentation PDF covering everything implemented:
login system, real-time discussions with WebSocket, metrics endpoints,
DB schema, bug fixes, and UI changes.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Preformatted, Table, TableStyle,
)


OUTPUT = "Nexus_Session_FullReport.pdf"

ACCENT     = HexColor("#1a7f37")
CODE_BG    = HexColor("#f5f5f5")
HEADER_BG  = HexColor("#0d1117")
HEADER_FG  = HexColor("#d4ff00")
SUBTLE     = HexColor("#444444")
RED        = HexColor("#a40000")

styles = getSampleStyleSheet()

H1 = ParagraphStyle("H1", parent=styles["Heading1"],
    fontSize=22, leading=26, spaceAfter=14,
    textColor=HEADER_BG, fontName="Helvetica-Bold")
H2 = ParagraphStyle("H2", parent=styles["Heading2"],
    fontSize=15, leading=19, spaceBefore=16, spaceAfter=8,
    textColor=ACCENT, fontName="Helvetica-Bold")
H3 = ParagraphStyle("H3", parent=styles["Heading3"],
    fontSize=12, leading=16, spaceBefore=12, spaceAfter=4,
    textColor=HEADER_BG, fontName="Helvetica-Bold")
H4 = ParagraphStyle("H4", parent=styles["Heading4"],
    fontSize=10, leading=14, spaceBefore=8, spaceAfter=2,
    textColor=SUBTLE, fontName="Helvetica-Bold")
BODY = ParagraphStyle("BODY", parent=styles["BodyText"],
    fontSize=10, leading=14, spaceAfter=6,
    alignment=TA_JUSTIFY, fontName="Helvetica")
CODE = ParagraphStyle("CODE", parent=styles["Code"],
    fontName="Courier", fontSize=8, leading=10,
    backColor=CODE_BG, borderPadding=6,
    leftIndent=6, rightIndent=6, textColor=HEADER_BG)
NOTE = ParagraphStyle("NOTE", parent=BODY,
    fontSize=9, leading=12, textColor=SUBTLE,
    leftIndent=10, rightIndent=10, spaceBefore=4, spaceAfter=8)
WARN = ParagraphStyle("WARN", parent=BODY,
    fontSize=9, leading=12, textColor=RED,
    leftIndent=10, rightIndent=10, spaceBefore=4, spaceAfter=8)


def p(text, style=BODY):
    return Paragraph(text, style)


def code(text):
    return Preformatted(text, CODE)


def section(title, lvl=2):
    return Paragraph(title, {1: H1, 2: H2, 3: H3, 4: H4}[lvl])


def tbl(rows, col_widths, has_header=True, mono_col=None):
    style_cmds = [
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
    ]
    if has_header:
        style_cmds += [
            ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), HEADER_FG),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BACKGROUND", (0, 1), (-1, -1), white),
        ]
    if mono_col is not None:
        style_cmds.append(("FONTNAME", (mono_col, 1), (mono_col, -1), "Courier"))
    t = Table(rows, colWidths=col_widths)
    t.setStyle(TableStyle(style_cmds))
    return t


story = []

# =====================================================================
# TITLE PAGE
# =====================================================================
story.append(section("Nexus &mdash; Full Session Report", 1))
story.append(p(
    "This document covers every change implemented during the session: "
    "the authentication system, the real-time discussions feature backed by "
    "WebSocket, computed metrics endpoints, database schema, bug fixes, "
    "UI cleanup, and presentation notes."
))
story.append(Spacer(1, 6))

story.append(tbl(
    [
        ["Project", "Nexus / Infra Pulse"],
        ["Stack backend", "FastAPI + psycopg2 + bcrypt + WebSocket + TimescaleDB (PostgreSQL)"],
        ["Stack frontend", "React 19 + Vite 8 + Material-UI v7"],
        ["Branch", "feature/login"],
        ["Backend port", "8002 (Python FastAPI)"],
        ["DB external port", "5433 (Docker maps -> 5432 internal)"],
        ["Total endpoints added", "9 REST + 1 WebSocket"],
        ["Files created", "7 (chat_api.py extended, 4 scripts, 2 frontend services, 1 component)"],
        ["Files modified", "8 (App, Layout, Login, Discussions, api.js, theme references, etc.)"],
    ],
    col_widths=[4 * cm, 11 * cm], has_header=False, mono_col=1
))
story.append(Spacer(1, 14))

# =====================================================================
# TABLE OF CONTENTS
# =====================================================================
story.append(section("Contents", 2))
toc = [
    "1. Architecture overview",
    "2. Database schema in full detail",
    "3. Authentication system (login, signup, logout)",
    "4. Real-time Discussions with WebSocket",
    "5. Computed metrics endpoints",
    "6. Bug fixes and stabilization",
    "7. UI improvements and humanization",
    "8. Helper scripts (CLI utilities)",
    "9. Setup and run instructions",
    "10. Demo / presentation script",
    "11. Security notes and known limitations",
    "12. File-by-file changelog",
]
for t in toc:
    story.append(p("&bull; " + t))

story.append(PageBreak())

# =====================================================================
# 1. ARCHITECTURE
# =====================================================================
story.append(section("1. Architecture overview", 1))

story.append(p(
    "Nexus runs as three independent processes that communicate over HTTP "
    "and WebSocket:"
))

story.append(tbl(
    [
        ["Component", "Port", "Stack", "Role"],
        ["Frontend (Vite dev server)", "5173", "React + MUI",
         "User interface, served as static SPA in dev"],
        ["Python API", "8002", "FastAPI + uvicorn",
         "Auth, discussions, metrics, chatbot, WebSocket"],
        ["Go API (legacy)", "8080", "Go + GORM",
         "Sensors, events, readings (pre-existing)"],
        ["PostgreSQL", "5433 ext / 5432 int", "TimescaleDB",
         "Persistence for all components"],
    ],
    col_widths=[4.5 * cm, 2.5 * cm, 3 * cm, 5 * cm]
))
story.append(Spacer(1, 8))

story.append(p(
    "<b>Request flow example &mdash; user comments on a discussion:</b>"
))
flow = [
    "User types comment in <font face='Courier'>Discussions.jsx</font> &rarr; presses Ctrl+Enter",
    "<font face='Courier'>discussionsApi.js</font> sends <font face='Courier'>POST /discussions/&lt;id&gt;/comments</font> to port 8002",
    "FastAPI <font face='Courier'>add_comment()</font> inserts row in <font face='Courier'>discussion_comments</font> table",
    "FastAPI <font face='Courier'>_WSManager.broadcast()</font> sends JSON to all WebSocket subscribers of that <font face='Courier'>discussion_id</font>",
    "All connected clients receive the message and append it to the rendered comment list",
]
for i, line in enumerate(flow, 1):
    story.append(p(f"{i}. {line}"))

story.append(Spacer(1, 6))
story.append(p(
    "<b>Why a separate Python API alongside the existing Go one?</b> "
    "We kept the Go server untouched because rewriting in Python would "
    "be redundant. Python gets the new features (auth, discussions, "
    "metrics) which are easier to iterate on; Go keeps serving sensors "
    "and event data it was built for. Each frontend module picks the "
    "right base URL.",
    NOTE
))

story.append(PageBreak())

# =====================================================================
# 2. DATABASE SCHEMA
# =====================================================================
story.append(section("2. Database schema (full)", 1))

story.append(p(
    "All tables live in PostgreSQL with the TimescaleDB extension. "
    "Migrations are auto-applied on first container start "
    "(<font face='Courier'>./migrations/*.sql</font> mounted as "
    "<font face='Courier'>/docker-entrypoint-initdb.d</font>)."
))

story.append(section("2.1 Migration 001_init.sql", 3))
story.append(code(
    "CREATE EXTENSION IF NOT EXISTS timescaledb;\n\n"
    "CREATE TABLE locations (\n"
    "    location_id     SERIAL PRIMARY KEY,\n"
    "    name            TEXT NOT NULL,\n"
    "    description     TEXT,\n"
    "    updated_user_id INTEGER NOT NULL,\n"
    "    is_obsolete     BOOLEAN NOT NULL DEFAULT FALSE\n"
    ");\n\n"
    "CREATE TABLE users (\n"
    "    user_id       SERIAL PRIMARY KEY,\n"
    "    first_name    TEXT NOT NULL,\n"
    "    last_name     TEXT,\n"
    "    email         TEXT NOT NULL UNIQUE,\n"
    "    role          TEXT NOT NULL,\n"
    "    password_hash TEXT NOT NULL,\n"
    "    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n"
    "    updated_dtm   TIMESTAMPTZ NOT NULL DEFAULT NOW()\n"
    ");\n\n"
    "CREATE TABLE sensors (\n"
    "    sensor_id       SERIAL PRIMARY KEY,\n"
    "    location_id     INTEGER NOT NULL REFERENCES locations(location_id),\n"
    "    updated_user_id INTEGER NOT NULL REFERENCES users(user_id),\n"
    "    sensor_no       TEXT UNIQUE,\n"
    "    name            TEXT,\n"
    "    is_obsolete     BOOLEAN NOT NULL DEFAULT FALSE,\n"
    "    lower_limit     DECIMAL(10, 2),\n"
    "    upper_limit     DECIMAL(10, 2),\n"
    "    updated_dtm     TIMESTAMPTZ NOT NULL DEFAULT NOW()\n"
    ");\n\n"
    "CREATE TABLE events (\n"
    "    event_id     SERIAL PRIMARY KEY,\n"
    "    location_id  INTEGER NOT NULL REFERENCES locations(location_id),\n"
    "    sensor_id    INTEGER NOT NULL REFERENCES sensors(sensor_id),\n"
    "    severity     TEXT NOT NULL,\n"
    "    status       TEXT NOT NULL DEFAULT 'open',\n"
    "    metric_value DECIMAL(10, 2) NOT NULL,\n"
    "    message      TEXT NOT NULL,\n"
    "    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n"
    "    updated_at   TIMESTAMPTZ,\n"
    "    resolved_at  TIMESTAMPTZ\n"
    ");"
))

story.append(p("<b>Key columns for the auth and metrics features:</b>"))
story.append(tbl(
    [
        ["Table.Column", "Why it matters"],
        ["users.email", "UNIQUE login identifier"],
        ["users.password_hash", "bcrypt hash (60 chars), never plaintext"],
        ["users.role", "Authorization (admin/user)"],
        ["events.severity", "Used by /metrics/observability for ERROR RATE"],
        ["events.created_at, events.resolved_at",
         "Difference fuels /metrics/resolution (avg time to resolve)"],
        ["events.status", "open / acknowledged / resolved"],
    ],
    col_widths=[5 * cm, 10 * cm], mono_col=0
))

story.append(section("2.2 Migration 003_discussions.sql (applied manually)", 3))
story.append(p(
    "This migration was added <i>after</i> the database was first "
    "started, so it wasn't auto-loaded. We applied it manually with "
    "<font face='Courier'>docker exec -i nexus-postgres psql ... &lt; migrations/003_discussions.sql</font>."
))
story.append(code(
    "CREATE TABLE discussions (\n"
    "    discussion_id    SERIAL PRIMARY KEY,\n"
    "    event_id         INTEGER REFERENCES events(event_id) ON DELETE SET NULL,\n"
    "    title            TEXT NOT NULL,\n"
    "    status           TEXT NOT NULL DEFAULT 'open',\n"
    "    creator_user_id  INTEGER REFERENCES users(user_id) ON DELETE SET NULL,\n"
    "    author_display   TEXT NOT NULL,\n"
    "    device_label     TEXT,\n"
    "    body             TEXT NOT NULL,\n"
    "    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n"
    "    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()\n"
    ");\n\n"
    "CREATE TABLE discussion_comments (\n"
    "    comment_id       SERIAL PRIMARY KEY,\n"
    "    discussion_id    INTEGER NOT NULL REFERENCES discussions(discussion_id) "
    "ON DELETE CASCADE,\n"
    "    user_id          INTEGER REFERENCES users(user_id) ON DELETE SET NULL,\n"
    "    author_display   TEXT NOT NULL,\n"
    "    message          TEXT NOT NULL,\n"
    "    is_system        BOOLEAN NOT NULL DEFAULT FALSE,\n"
    "    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()\n"
    ");\n\n"
    "CREATE INDEX discussions_event_id_idx ON discussions(event_id);\n"
    "CREATE INDEX discussions_status_created_idx\n"
    "    ON discussions(status, created_at DESC);\n"
    "CREATE INDEX discussion_comments_discussion_created_idx\n"
    "    ON discussion_comments(discussion_id, created_at);"
))

story.append(p("<b>Design choices for the discussions tables:</b>"))
story.append(p(
    "&bull; <b>ON DELETE CASCADE</b> on comments &rarr; deleting a discussion "
    "wipes its comments. No orphan rows."
))
story.append(p(
    "&bull; <b>ON DELETE SET NULL</b> for user references &rarr; if a user "
    "account is deleted, comments stay but lose the user link. "
    "Author name is kept in <font face='Courier'>author_display</font>."
))
story.append(p(
    "&bull; <b>is_system flag</b> &rarr; distinguishes auto-generated entries "
    "(e.g. 'Status changed by [admin]') from real user comments."
))
story.append(p(
    "&bull; <b>Compound index</b> on <font face='Courier'>(status, created_at DESC)</font> "
    "&rarr; fast list of open discussions sorted by recency."
))

story.append(section("2.3 Seeded data", 3))
story.append(p(
    "Two scripts ensure the database is usable right after a fresh install:"
))
story.append(p(
    "&bull; <font face='Courier'>set_password.py</font> &rarr; replaces "
    "<font face='Courier'>placeholder_hash</font> for the seeded admin "
    "with a real bcrypt hash, so login actually works."
))
story.append(p(
    "&bull; <font face='Courier'>seed_discussions.py</font> &rarr; inserts "
    "three initial discussions with comments. All linked to "
    "<font face='Courier'>creator_user_id = 1</font> (admin)."
))

story.append(PageBreak())

# =====================================================================
# 3. AUTH SYSTEM
# =====================================================================
story.append(section("3. Authentication system", 1))

story.append(section("3.1 End-to-end flow", 3))
story.append(p(
    "<b>Login:</b> Login.jsx form &rarr; <font face='Courier'>authApi.loginUser()</font> "
    "&rarr; <font face='Courier'>POST /login</font> &rarr; bcrypt verify in chat_api.py "
    "&rarr; user JSON returned &rarr; App.jsx stores it in <font face='Courier'>sessionStorage.nexus_user</font> "
    "&rarr; Layout renders email + role at top right."
))
story.append(p(
    "<b>Signup:</b> Same form, mode toggled &rarr; <font face='Courier'>POST /signup</font> "
    "&rarr; bcrypt hashes the new password &rarr; INSERT in users table with "
    "<font face='Courier'>role='user'</font> &rarr; backend returns user data "
    "&rarr; frontend goes back to login mode with green confirmation message."
))
story.append(p(
    "<b>Logout:</b> Click avatar &rarr; Logout (red) &rarr; sessionStorage cleared "
    "&rarr; <font face='Courier'>App.jsx</font> re-renders the Login screen "
    "(useEffect also resets the URL to <font face='Courier'>?page=Login</font>)."
))

story.append(section("3.2 Backend /login endpoint", 3))
story.append(code(
    "@app.post(\"/login\", response_model=LoginResponse)\n"
    "def login(request: LoginRequest):\n"
    "    with closing(_db_connect()) as conn:\n"
    "        with conn.cursor() as cur:\n"
    "            cur.execute(\n"
    "                \"SELECT user_id, email, role, first_name, last_name, \"\n"
    "                \"password_hash FROM users WHERE email = %s\",\n"
    "                (request.email.lower().strip(),),\n"
    "            )\n"
    "            row = cur.fetchone()\n"
    "\n"
    "    if not row:\n"
    "        raise HTTPException(status_code=401, detail=\"Invalid credentials\")\n"
    "\n"
    "    user_id, email, role, first_name, last_name, password_hash = row\n"
    "\n"
    "    try:\n"
    "        ok = bcrypt.checkpw(\n"
    "            request.password.encode(\"utf-8\"),\n"
    "            password_hash.encode(\"utf-8\"),\n"
    "        )\n"
    "    except (ValueError, TypeError):\n"
    "        ok = False\n"
    "\n"
    "    if not ok:\n"
    "        raise HTTPException(status_code=401, detail=\"Invalid credentials\")\n"
    "\n"
    "    return LoginResponse(user_id=user_id, email=email, role=role,\n"
    "                        first_name=first_name, last_name=last_name)"
))

story.append(p("<b>Notable defensive choices:</b>"))
story.append(p(
    "&bull; Same error message (\"Invalid credentials\") for both wrong-user "
    "and wrong-password &rarr; prevents account enumeration."
))
story.append(p(
    "&bull; Try/except around <font face='Courier'>bcrypt.checkpw</font> "
    "&rarr; legacy/placeholder hashes won't crash the endpoint, they just fail auth."
))
story.append(p(
    "&bull; Parameterized SQL (<font face='Courier'>%s</font>) &rarr; safe against injection."
))

story.append(section("3.3 Backend /signup endpoint", 3))
story.append(code(
    "@app.post(\"/signup\", response_model=LoginResponse)\n"
    "def signup(request: SignupRequest):\n"
    "    email = request.email.lower().strip()\n"
    "    pw_hash = bcrypt.hashpw(\n"
    "        request.password.encode(\"utf-8\"),\n"
    "        bcrypt.gensalt(),\n"
    "    ).decode(\"utf-8\")\n"
    "\n"
    "    with closing(_db_connect()) as conn:\n"
    "        with conn.cursor() as cur:\n"
    "            cur.execute(\"SELECT 1 FROM users WHERE email = %s\", (email,))\n"
    "            if cur.fetchone():\n"
    "                raise HTTPException(409, \"Email already registered\")\n"
    "\n"
    "            cur.execute(\n"
    "                \"INSERT INTO users (first_name, last_name, email, role, \"\n"
    "                \"password_hash) VALUES (%s, %s, %s, %s, %s) \"\n"
    "                \"RETURNING user_id, email, role, first_name, last_name\",\n"
    "                (request.first_name, request.last_name, email,\n"
    "                 \"user\", pw_hash),\n"
    "            )\n"
    "            user_id, email, role, first_name, last_name = cur.fetchone()\n"
    "            conn.commit()\n"
    "    return LoginResponse(...)"
))

story.append(section("3.4 Frontend gating in App.jsx", 3))
story.append(code(
    "function App() {\n"
    "  const [user, setUser] = useState(() => {\n"
    "    try {\n"
    "      const raw = sessionStorage.getItem('nexus_user');\n"
    "      return raw ? JSON.parse(raw) : null;\n"
    "    } catch { return null; }\n"
    "  });\n"
    "  const isAuthed = !!user;\n"
    "\n"
    "  const handleLogin = (userData) => {\n"
    "    sessionStorage.setItem('nexus_user', JSON.stringify(userData));\n"
    "    setUser(userData);\n"
    "  };\n"
    "\n"
    "  const handleLogout = () => {\n"
    "    sessionStorage.removeItem('nexus_user');\n"
    "    setUser(null);\n"
    "  };\n"
    "\n"
    "  useEffect(() => {\n"
    "    if (!isAuthed && params.page !== 'Login') {\n"
    "      patchParams({ page: 'Login' }, { replaceHistory: true });\n"
    "    } else if (isAuthed && params.page === 'Login') {\n"
    "      patchParams({ page: 'Dashboard' }, { replaceHistory: true });\n"
    "    }\n"
    "  }, [isAuthed, params.page, patchParams]);\n"
    "\n"
    "  if (!isAuthed) {\n"
    "    return (\n"
    "      <ThemeProvider theme={glassTheme}>\n"
    "        <Login onLogin={handleLogin} />\n"
    "      </ThemeProvider>\n"
    "    );\n"
    "  }\n"
    "  // ... rest of app\n"
    "}"
))
story.append(p(
    "<b>Lazy initializer</b> &rarr; sessionStorage is read once at mount, "
    "not on every render. The <b>auth gate</b> &rarr; if no user, the "
    "rest of the app simply isn't rendered, so unauthenticated users "
    "literally cannot navigate to any other page.",
    NOTE
))

story.append(PageBreak())

# =====================================================================
# 4. DISCUSSIONS + WS
# =====================================================================
story.append(section("4. Real-time Discussions with WebSocket", 1))

story.append(p(
    "Goal: when one user posts a comment in a discussion thread, "
    "every other user currently viewing the same thread sees it appear "
    "instantly &mdash; no refresh, no polling needed."
))

story.append(section("4.1 REST endpoints", 3))
story.append(tbl(
    [
        ["Method + path", "Purpose"],
        ["GET /discussions",
         "List all threads with comment count"],
        ["GET /discussions/{id}",
         "Full thread + comments, ordered ascending"],
        ["POST /discussions",
         "Create a new thread (status=OPEN, role=user)"],
        ["POST /discussions/{id}/comments",
         "Add a comment + broadcast through WebSocket"],
        ["PATCH /discussions/{id}/status",
         "Toggle OPEN/RESOLVED + auto system comment + broadcast"],
        ["WS /ws/discussions/{id}",
         "Live subscription channel"],
    ],
    col_widths=[6 * cm, 9 * cm], mono_col=0
))

story.append(section("4.2 WebSocket connection manager", 3))
story.append(code(
    "class _WSManager:\n"
    "    def __init__(self):\n"
    "        self.subs: dict[int, set[WebSocket]] = defaultdict(set)\n"
    "        self._lock = asyncio.Lock()\n"
    "\n"
    "    async def connect(self, discussion_id, ws):\n"
    "        await ws.accept()\n"
    "        async with self._lock:\n"
    "            self.subs[discussion_id].add(ws)\n"
    "\n"
    "    async def disconnect(self, discussion_id, ws):\n"
    "        async with self._lock:\n"
    "            self.subs[discussion_id].discard(ws)\n"
    "            if not self.subs[discussion_id]:\n"
    "                self.subs.pop(discussion_id, None)\n"
    "\n"
    "    async def broadcast(self, discussion_id, payload):\n"
    "        msg = json.dumps(payload, default=str)\n"
    "        async with self._lock:\n"
    "            targets = list(self.subs.get(discussion_id, ()))\n"
    "        dead = []\n"
    "        for ws in targets:\n"
    "            try:\n"
    "                await ws.send_text(msg)\n"
    "            except Exception:\n"
    "                dead.append(ws)\n"
    "        for ws in dead:\n"
    "            await self.disconnect(discussion_id, ws)\n"
    "\n"
    "manager = _WSManager()\n"
    "\n"
    "@app.websocket(\"/ws/discussions/{discussion_id}\")\n"
    "async def ws_discussion(websocket, discussion_id):\n"
    "    await manager.connect(discussion_id, websocket)\n"
    "    try:\n"
    "        await websocket.send_text(json.dumps(\n"
    "            {\"type\": \"hello\", \"discussion_id\": discussion_id}))\n"
    "        while True:\n"
    "            await websocket.receive_text()  # keep alive, ignore content\n"
    "    except WebSocketDisconnect:\n"
    "        pass\n"
    "    finally:\n"
    "        await manager.disconnect(discussion_id, websocket)"
))

story.append(p("<b>Design notes:</b>"))
story.append(p(
    "&bull; <b>Per-thread subscriber set</b> &rarr; broadcast targets only "
    "the clients watching that exact discussion. Two threads = two isolated rooms."
))
story.append(p(
    "&bull; <b>Async lock</b> protects the subscriber map during concurrent "
    "connect/disconnect."
))
story.append(p(
    "&bull; <b>Dead-socket cleanup</b> &rarr; if send_text raises, the WebSocket "
    "is removed from the room automatically."
))
story.append(p(
    "&bull; <b>Hello message</b> on connect &rarr; the frontend uses it to flip "
    "the badge from <font face='Courier'>OFFLINE</font> to "
    "<font face='Courier'>LIVE</font>."
))

story.append(section("4.3 Broadcasting on new comment", 3))
story.append(code(
    "@app.post(\"/discussions/{discussion_id}/comments\", response_model=CommentOut)\n"
    "async def add_comment(discussion_id: int, req: NewCommentRequest):\n"
    "    with closing(_db_connect()) as conn:\n"
    "        with conn.cursor() as cur:\n"
    "            cur.execute(\n"
    "                \"INSERT INTO discussion_comments (discussion_id, user_id, \"\n"
    "                \"author_display, message, is_system) \"\n"
    "                \"VALUES (%s, %s, %s, %s, FALSE) \"\n"
    "                \"RETURNING comment_id, discussion_id, author_display, \"\n"
    "                \"message, is_system, created_at\",\n"
    "                (discussion_id, req.user_id, req.author_display, req.message),\n"
    "            )\n"
    "            row = cur.fetchone()\n"
    "            cur.execute(\"UPDATE discussions SET updated_at = NOW() \"\n"
    "                        \"WHERE discussion_id = %s\", (discussion_id,))\n"
    "            conn.commit()\n"
    "\n"
    "    comment = CommentOut(...row...)\n"
    "    await manager.broadcast(\n"
    "        discussion_id,\n"
    "        {\"type\": \"comment\", \"data\": comment.model_dump()},\n"
    "    )\n"
    "    return comment"
))
story.append(p(
    "<b>The DB write happens first, the broadcast after.</b> "
    "This way the message is durable even if the WebSocket fan-out fails "
    "partway. Late joiners get the data on the next GET; live clients see "
    "it instantly via WS.",
    NOTE
))

story.append(section("4.4 Frontend subscription client", 3))
story.append(code(
    "export const subscribeToDiscussion = (discussionId, onEvent) => {\n"
    "  const wsUrl = `${getWsBaseUrl()}/ws/discussions/${discussionId}`;\n"
    "  const state = { closed: false, ws: null, retryMs: 1000, pingTimer: null };\n"
    "\n"
    "  const open = () => {\n"
    "    if (state.closed) return;\n"
    "    const ws = new WebSocket(wsUrl);\n"
    "    state.ws = ws;\n"
    "\n"
    "    ws.onopen = () => {\n"
    "      state.retryMs = 1000;\n"
    "      state.pingTimer = setInterval(() => {\n"
    "        if (ws.readyState === WebSocket.OPEN) ws.send('ping');\n"
    "      }, 25000);\n"
    "    };\n"
    "\n"
    "    ws.onmessage = (e) => {\n"
    "      try { onEvent?.(JSON.parse(e.data)); } catch {}\n"
    "    };\n"
    "\n"
    "    ws.onclose = () => {\n"
    "      if (state.pingTimer) clearInterval(state.pingTimer);\n"
    "      if (state.closed) return;\n"
    "      setTimeout(open, state.retryMs);\n"
    "      state.retryMs = Math.min(state.retryMs * 2, 10000);  // capped backoff\n"
    "    };\n"
    "  };\n"
    "\n"
    "  open();\n"
    "  return () => {\n"
    "    state.closed = true;\n"
    "    if (state.pingTimer) clearInterval(state.pingTimer);\n"
    "    if (state.ws && state.ws.readyState <= 1) state.ws.close();\n"
    "  };\n"
    "};"
))
story.append(p("<b>Robustness features baked in:</b>"))
story.append(p(
    "&bull; <b>Exponential backoff</b> (1s &rarr; 2s &rarr; 4s &rarr; 8s &rarr; 10s cap) "
    "on unexpected disconnect."
))
story.append(p(
    "&bull; <b>25s heartbeat ping</b> &rarr; some proxies kill idle WebSockets "
    "after ~30s. A periodic <font face='Courier'>send('ping')</font> keeps them alive."
))
story.append(p(
    "&bull; <b>Closed flag</b> &rarr; the cleanup function from "
    "<font face='Courier'>useEffect</font> sets <font face='Courier'>closed=true</font> "
    "so the reconnect loop stops when the component unmounts."
))

story.append(section("4.5 React integration", 3))
story.append(code(
    "useEffect(() => {\n"
    "  if (!incidentId) return;\n"
    "  setWsConnected(false);\n"
    "\n"
    "  const unsubscribe = subscribeToDiscussion(incidentId, (event) => {\n"
    "    if (event?.type === 'hello') {\n"
    "      setWsConnected(true);\n"
    "      return;\n"
    "    }\n"
    "    if (event?.type === 'comment' && event.data) {\n"
    "      setSelectedDetail((prev) => {\n"
    "        if (!prev || prev.discussion_id !== event.data.discussion_id) return prev;\n"
    "        if (prev.comments.some((c) => c.comment_id === event.data.comment_id)) return prev;\n"
    "        return { ...prev, comments: [...prev.comments, event.data] };\n"
    "      });\n"
    "    }\n"
    "    if (event?.type === 'status' && event.data) {\n"
    "      setSelectedDetail((prev) => prev\n"
    "        ? { ...prev, status: event.data.status }\n"
    "        : prev);\n"
    "      reloadList();\n"
    "    }\n"
    "  });\n"
    "\n"
    "  return () => { unsubscribe(); setWsConnected(false); };\n"
    "}, [incidentId, reloadList]);"
))
story.append(p(
    "<b>Idempotent appends</b> &rarr; the <font face='Courier'>some(c =&gt; c.comment_id === ...)</font> "
    "check skips duplicates in case both the POST response and the WS broadcast "
    "deliver the same comment. Without this, you would see the comment twice "
    "in your own client."
))

story.append(PageBreak())

# =====================================================================
# 5. METRICS
# =====================================================================
story.append(section("5. Computed metrics endpoints", 1))

story.append(p(
    "Replaced two frontend mocks (<font face='Courier'>fetchObservabilityMetrics</font>, "
    "<font face='Courier'>fetchResolutionData</font>) with real database queries "
    "in Python."
))

story.append(section("5.1 GET /metrics/observability", 3))
story.append(code(
    "@app.get(\"/metrics/observability\")\n"
    "def metrics_observability():\n"
    "    with closing(_db_connect()) as conn:\n"
    "        with conn.cursor() as cur:\n"
    "            cur.execute(\"SELECT MIN(created_at) FROM events\")\n"
    "            first_event = cur.fetchone()[0]\n"
    "\n"
    "            cur.execute(\n"
    "                \"SELECT COUNT(*) FILTER (\"\n"
    "                \"   WHERE LOWER(severity) IN ('critical', 'incident')) AS errors, \"\n"
    "                \"  COUNT(*) AS total \"\n"
    "                \"FROM events \"\n"
    "                \"WHERE created_at >= NOW() - INTERVAL '24 hours'\"\n"
    "            )\n"
    "            errors, total = cur.fetchone()\n"
    "\n"
    "    # uptime formatting: Xd Yh / Yh Zm / Zm\n"
    "    # error rate: ratio of critical+incident in last 24h\n"
    "    return [\n"
    "        ObservabilityMetric(id=1, label=\"UPTIME\", value=uptime_str, sublabel=...),\n"
    "        ObservabilityMetric(id=2, label=\"ERROR RATE\", value=err_str, sublabel=...),\n"
    "    ]"
))
story.append(p(
    "<b>UPTIME</b> &mdash; uses <font face='Courier'>MIN(created_at)</font> on "
    "events. <b>ERROR RATE</b> &mdash; <font face='Courier'>FILTER (WHERE ...)</font> "
    "is a PostgreSQL aggregate construct that counts only rows matching a "
    "condition, in a single pass. Cleaner than COUNT(CASE WHEN ...)."
))

story.append(section("5.2 GET /metrics/resolution", 3))
story.append(code(
    "@app.get(\"/metrics/resolution\")\n"
    "def metrics_resolution():\n"
    "    with closing(_db_connect()) as conn:\n"
    "        with conn.cursor() as cur:\n"
    "            cur.execute(\n"
    "                \"SELECT TO_CHAR(date_trunc('day', resolved_at), 'Dy') AS day, \"\n"
    "                \"  date_trunc('day', resolved_at) AS d, \"\n"
    "                \"  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60.0) \"\n"
    "                \"FROM events \"\n"
    "                \"WHERE resolved_at IS NOT NULL \"\n"
    "                \"  AND resolved_at >= NOW() - INTERVAL '7 days' \"\n"
    "                \"GROUP BY d, day \"\n"
    "                \"ORDER BY d ASC\"\n"
    "            )\n"
    "            rows = cur.fetchall()\n"
    "    return [ResolutionPoint(day=r[0].strip(), time=float(r[2] or 0)) for r in rows]"
))
story.append(p(
    "<b>EXTRACT(EPOCH FROM interval)</b> &rarr; converts a duration to seconds; "
    "we divide by 60 to get minutes. <b>date_trunc('day', ...)</b> &rarr; "
    "groups multiple events resolved the same day together, regardless of time."
))

story.append(section("5.3 Frontend wiring", 3))
story.append(code(
    "// src/services/api.js\n"
    "import { getChatApiBaseUrl } from './chatApi';\n"
    "\n"
    "export const fetchObservabilityMetrics = async () => {\n"
    "  try {\n"
    "    const res = await fetch(`${getChatApiBaseUrl()}/metrics/observability`);\n"
    "    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n"
    "    return await res.json();\n"
    "  } catch (err) {\n"
    "    console.error('fetchObservabilityMetrics failed', err);\n"
    "    return [\n"
    "      { id: 1, label: 'UPTIME',     value: 'OFFLINE', sublabel: 'Backend down' },\n"
    "      { id: 2, label: 'ERROR RATE', value: 'N/A',     sublabel: 'Backend down' },\n"
    "    ];\n"
    "  }\n"
    "};"
))

story.append(PageBreak())

# =====================================================================
# 6. BUG FIXES
# =====================================================================
story.append(section("6. Bug fixes and stabilization", 1))

story.append(section("6.1 ChartWidget hover crash", 3))
story.append(p(
    "<b>Symptom:</b> Hovering over the Thermal Metrics chart on Dashboard "
    "caused the whole page to go black with "
    "<font face='Courier'>ReferenceError: seriesName is not defined</font>."
))
story.append(p(
    "<b>Cause:</b> CustomTooltip was defined outside the ChartWidget closure "
    "but tried to reference variables (<font face='Courier'>seriesName</font>, "
    "<font face='Courier'>unit</font>) that only existed inside the parent component."
))
story.append(code(
    "// Before (broken):\n"
    "const CustomTooltip = ({ active, payload, label }) => {\n"
    "  // ...\n"
    "  {payload.map((entry) => (\n"
    "    <Typography>{seriesName}: {entry.value}{unit}</Typography>\n"
    "                  ^^^^^^^^^^ undefined here!\n"
    "  ))}\n"
    "};\n"
    "\n"
    "// After (fixed):\n"
    "const CustomTooltip = ({ active, payload, label, unit = '' }) => {\n"
    "  {payload.map((entry) => (\n"
    "    <Typography>{entry.name || 'VALUE'}: {entry.value}{unit}</Typography>\n"
    "  ))}\n"
    "};\n"
    "// Recharts populates entry.name automatically from <Line name='...' />"
))

story.append(section("6.2 Dashboard duplicate declaration", 3))
story.append(p(
    "<b>Symptom:</b> Vite parse error: <font face='Courier'>Expected } but found EOF</font>."
))
story.append(p(
    "<b>Cause:</b> An import was inserted in the middle of the function body "
    "and the component declaration was duplicated:"
))
story.append(code(
    "// Broken file:\n"
    "const Dashboard = () => {                       // first declaration\n"
    "  const [params, patchParams] = useUrlState();\n"
    "import { COLORS } from '../theme/colors';       // import inside function!\n"
    "\n"
    "const Dashboard = ({ setActivePage }) => {     // second declaration\n"
    "  // ..."
))
story.append(p(
    "<b>Fix:</b> Moved the import to the top of the file, kept a single "
    "declaration accepting <font face='Courier'>{ setActivePage }</font>."
))

story.append(section("6.3 ErrorBoundary as safety net", 3))
story.append(p(
    "Added a class component that catches any render error in the React "
    "tree, logs the stack to console and renders a friendly recovery card "
    "(<i>Try Again</i>, <i>Reload</i>, <i>Logout + Reset</i>) instead of "
    "leaving the user with a blank page."
))
story.append(code(
    "class ErrorBoundary extends React.Component {\n"
    "  state = { error: null, info: null };\n"
    "\n"
    "  static getDerivedStateFromError(error) { return { error }; }\n"
    "\n"
    "  componentDidCatch(error, info) {\n"
    "    console.error(`[ErrorBoundary / ${this.props.scope}]`, error, info);\n"
    "    this.setState({ info });\n"
    "  }\n"
    "\n"
    "  reset = () => this.setState({ error: null, info: null });\n"
    "\n"
    "  render() {\n"
    "    if (!this.state.error) return this.props.children;\n"
    "    return <FallbackCard error={this.state.error} onReset={this.reset} />;\n"
    "  }\n"
    "}\n"
    "\n"
    "// Mounted twice:\n"
    "//   - main.jsx wraps <App /> entirely (root scope)\n"
    "//   - App.jsx wraps each page (scope = page name)\n"
    "// The page-level boundary uses key={activePage} so navigating to a\n"
    "// different page also resets a previous error state."
))

story.append(section("6.4 Polling intervals stabilization", 3))
story.append(p(
    "Multiple components polled every 5 seconds. With the backend slow "
    "or down, requests piled up and made the browser unresponsive "
    "(\"site crapă foarte ușor\"). Doubled or tripled all intervals."
))
story.append(tbl(
    [
        ["Component", "Before", "After"],
        ["Dashboard.jsx",           "5s",  "30s"],
        ["Tickets.jsx",             "5s",  "30s"],
        ["SeverityPieChart.jsx",    "5s",  "30s"],
        ["AlarmFrequencyChart.jsx", "15s", "60s"],
        ["Layout.jsx notifications","15s", "60s"],
    ],
    col_widths=[5 * cm, 3 * cm, 3 * cm], mono_col=0
))

story.append(PageBreak())

# =====================================================================
# 7. UI IMPROVEMENTS
# =====================================================================
story.append(section("7. UI improvements and humanization", 1))

story.append(section("7.1 Dashboard cards are now clickable", 3))
story.append(code(
    "const CARD_TARGET = {\n"
    "  'CPU TEMP':     'Observability',\n"
    "  'OPEN TICKETS': 'Tickets',\n"
    "  'TOTAL EVENTS': 'Tickets',\n"
    "  'SENSOR ID':    'Devices',\n"
    "};\n"
    "const target = CARD_TARGET[metric.title];\n"
    "const clickable = !!target && typeof setActivePage === 'function';\n"
    "<Card\n"
    "  onClick={clickable ? () => setActivePage(target) : undefined}\n"
    "  sx={{ cursor: clickable ? 'pointer' : 'default', ... }}\n"
    ">"
))

story.append(section("7.2 Text rewrite &mdash; from AI marketing to human", 3))
story.append(p(
    "Every page subtitle and most headings sounded like generated SaaS "
    "marketing copy. Replaced with short, human phrasing."
))
story.append(tbl(
    [
        ["Before", "After"],
        ["Incident Control Panel",
         "Overview"],
        ["Device Management",
         "Devices"],
        ["Ticket Management",
         "Open Tickets"],
        ["Metrics & Logs",
         "Observability"],
        ["Command Center",
         "NOC Wall"],
        ["Incident Discussions",
         "Discussions"],
        ["Provision, monitor, and manage your infrastructure assets.",
         "Sensors, locations, and physical units in the network."],
        ["System telemetry, active KPIs, and the tail of recent events.",
         "Live metrics and the latest log entries."],
        ["Active system alerts requiring operator intervention and acknowledgement.",
         "Open alarms waiting to be acknowledged."],
        ["Drag & drop to rearrange active monitoring feeds.",
         "Drag the panels to rearrange."],
        ["Conversational AI for telemetry, incidents and database insights.",
         "Ask about sensors, incidents, or the database."],
        ["Centralized forum for investigating and documenting system alarms.",
         "Threads about incidents. Add comments, change status."],
        ["GLOBAL_TELEMETRY (sidebar label)",
         "System Stats"],
    ],
    col_widths=[7 * cm, 8 * cm]
))

story.append(section("7.3 Login screen polish", 3))
story.append(p(
    "&bull; Background changed to solid gray (<font face='Courier'>#232323</font>) "
    "&mdash; cleaner than the white default."
))
story.append(p(
    "&bull; Field labels are always visible above their inputs "
    "(<font face='Courier'>InputLabelProps={{ shrink: true }}</font>) instead "
    "of waiting for click."
))
story.append(p(
    "&bull; Enter submits the form (wrapped in <font face='Courier'>&lt;Box "
    "component='form' onSubmit={handleSubmit}&gt;</font> + button "
    "<font face='Courier'>type='submit'</font>)."
))
story.append(p(
    "&bull; URL stays in sync: <font face='Courier'>?page=Login</font> when "
    "logged out, <font face='Courier'>?page=Dashboard</font> after login."
))
story.append(p(
    "&bull; Removed dead UI: <i>Remember me</i> checkbox, <i>Forgot password?</i> link, "
    "<i>SSO/IDP Provider</i> button and <i>v0.1.0 MOCK</i> footer &mdash; "
    "none of them did anything."
))

story.append(section("7.4 Profile menu shows real user", 3))
story.append(p(
    "Layout.jsx receives the <font face='Courier'>user</font> prop from App.jsx "
    "and renders:"
))
story.append(p(
    "&bull; Email + role chip next to the avatar (top right)"
))
story.append(p(
    "&bull; Inside the popover: full name + email + role + green dot"
))
story.append(p(
    "&bull; Red <b>Logout</b> action that calls <font face='Courier'>onLogout</font>, "
    "which clears <font face='Courier'>sessionStorage.nexus_user</font> and "
    "triggers the app to re-render the Login screen."
))

story.append(PageBreak())

# =====================================================================
# 8. CLI SCRIPTS
# =====================================================================
story.append(section("8. Helper CLI scripts", 1))

story.append(p(
    "Three small scripts make the system bootstrap and user management painless. "
    "All read <font face='Courier'>DB_*</font> values from <font face='Courier'>.env</font>."
))

story.append(section("8.1 set_password.py", 3))
story.append(code(
    "# Usage: python set_password.py <email> <new_password>\n"
    "# Example: python set_password.py admin@infrapulse.com admin123\n"
    "\n"
    "email = sys.argv[1].lower().strip()\n"
    "password = sys.argv[2]\n"
    "pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')\n"
    "\n"
    "cur.execute(\n"
    "    \"UPDATE users SET password_hash = %s, updated_dtm = NOW() \"\n"
    "    \"WHERE email = %s RETURNING user_id\",\n"
    "    (pw_hash, email),\n"
    ")"
))

story.append(section("8.2 create_user.py", 3))
story.append(code(
    "# Usage: python create_user.py <email> <pass> <first> [last] [role]\n"
    "# Example: python create_user.py john@x.com pwd123 John Doe user\n"
    "\n"
    "email      = sys.argv[1].lower().strip()\n"
    "password   = sys.argv[2]\n"
    "first_name = sys.argv[3]\n"
    "last_name  = sys.argv[4] if len(sys.argv) > 4 else ''\n"
    "role       = sys.argv[5] if len(sys.argv) > 5 else 'user'\n"
    "\n"
    "pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()\n"
    "\n"
    "cur.execute(\n"
    "    \"SELECT user_id FROM users WHERE email = %s\", (email,))\n"
    "if cur.fetchone():\n"
    "    sys.exit(2)  # already exists\n"
    "\n"
    "cur.execute(\n"
    "    \"INSERT INTO users (first_name, last_name, email, role, \"\n"
    "    \"password_hash) VALUES (%s, %s, %s, %s, %s) RETURNING user_id\",\n"
    "    (first_name, last_name, email, role, pw_hash),\n"
    ")"
))

story.append(section("8.3 seed_discussions.py", 3))
story.append(p(
    "Idempotent &mdash; if the table already has rows it bails out. "
    "Inserts three threads + their comments. All linked to "
    "<font face='Courier'>creator_user_id = 1</font> (admin)."
))
story.append(code(
    "for d in SEED:\n"
    "    cur.execute(\n"
    "        \"INSERT INTO discussions (title, status, author_display, \"\n"
    "        \"device_label, body, creator_user_id) \"\n"
    "        \"VALUES (%s, %s, %s, %s, %s, 1) RETURNING discussion_id\",\n"
    "        (d['title'], d['status'], d['author_display'],\n"
    "         d['device_label'], d['body']),\n"
    "    )\n"
    "    did = cur.fetchone()[0]\n"
    "    for author, is_system, msg in d['comments']:\n"
    "        cur.execute(\n"
    "            \"INSERT INTO discussion_comments (discussion_id, \"\n"
    "            \"author_display, message, is_system) \"\n"
    "            \"VALUES (%s, %s, %s, %s)\",\n"
    "            (did, author, msg, is_system),\n"
    "        )"
))

# =====================================================================
# 9. SETUP
# =====================================================================
story.append(section("9. Setup and run instructions", 1))

story.append(section("9.1 First-time setup", 3))
story.append(code(
    "# 1. Install Python dependencies\n"
    "python -m pip install bcrypt reportlab\n"
    "# (psycopg2-binary, fastapi, uvicorn, websockets, dotenv\n"
    "#  were already in requirements.txt)\n"
    "\n"
    "# 2. Make sure .env has DB_PORT=5433 (Docker external port)\n"
    "#    .env example:\n"
    "#      DB_HOST=localhost\n"
    "#      DB_PORT=5433\n"
    "#      DB_USER=postgres\n"
    "#      DB_PASSWORD=postgres\n"
    "#      DB_NAME=nexus\n"
    "#      VITE_CHAT_API_BASE_URL=http://127.0.0.1:8002\n"
    "\n"
    "# 3. Start Postgres\n"
    "docker compose up -d postgres\n"
    "\n"
    "# 4. Apply migration 003 (one-time, since it was added after first start)\n"
    "docker exec -i nexus-postgres psql -U postgres -d nexus < migrations/003_discussions.sql\n"
    "\n"
    "# 5. Seed initial discussion threads\n"
    "python seed_discussions.py\n"
    "\n"
    "# 6. Set a real password for the seeded admin\n"
    "python set_password.py admin@infrapulse.com admin123"
))

story.append(section("9.2 Daily run", 3))
story.append(code(
    "# Terminal 1 - Python API (login, discussions, metrics, chatbot, WS)\n"
    "python -m uvicorn chat_api:app --reload --port 8002\n"
    "\n"
    "# Terminal 2 - frontend\n"
    "npm run dev"
))
story.append(p(
    "Open <font face='Courier'>http://localhost:5173</font> &rarr; you "
    "land on the login screen automatically because <font face='Courier'>App.jsx</font> "
    "detects no <font face='Courier'>nexus_user</font> in sessionStorage."
))

story.append(PageBreak())

# =====================================================================
# 10. DEMO SCRIPT
# =====================================================================
story.append(section("10. Demo / presentation script", 1))

story.append(p(
    "Suggested flow for showing the project. Each step takes ~10-15 seconds."
))

story.append(section("Step 1 &mdash; Auth gating", 3))
story.append(p(
    "Show that going to <font face='Courier'>localhost:5173</font> immediately "
    "redirects to <font face='Courier'>?page=Login</font>. Try typing a wrong "
    "password &rarr; red <i>Invalid credentials</i>. Type the right one &rarr; "
    "Dashboard loads, email appears top-right."
))

story.append(section("Step 2 &mdash; Sign up a new user", 3))
story.append(p(
    "Click <i>Don't have account? Sign up</i> &rarr; fill in first/last name, "
    "email, password &rarr; click <i>Create account</i>. The form returns to "
    "login mode with a green <i>Account created. Please sign in.</i> message. "
    "Confirm in the DB:"
))
story.append(code(
    "docker exec -it nexus-postgres psql -U postgres -d nexus \\\n"
    "  -c \"SELECT user_id, email, role, created_at FROM users ORDER BY user_id;\""
))

story.append(section("Step 3 &mdash; Real-time discussions (the wow moment)", 3))
story.append(p(
    "&bull; Open <b>two browser windows</b> side by side (one normal, one private) "
    "&rarr; log in as two different users."
))
story.append(p(
    "&bull; Both navigate to <font face='Courier'>?page=Discussions&incident=1</font>."
))
story.append(p(
    "&bull; Notice the green <b>LIVE</b> badge in the top right (WebSocket connected)."
))
story.append(p(
    "&bull; Type a comment in window A &rarr; it appears <b>instantly</b> in window B."
))
story.append(p(
    "&bull; Click <i>Close Incident</i> in window B &rarr; status chip flips "
    "from <font color='red'>OPEN</font> to <font face='Courier'>RESOLVED</font> "
    "in both windows, plus a system comment is auto-inserted."
))
story.append(p(
    "<b>Closing the demo:</b> open the DB and show the persisted comments &mdash; "
    "nothing was ephemeral.",
    NOTE
))
story.append(code(
    "docker exec -it nexus-postgres psql -U postgres -d nexus -c \\\n"
    "  \"SELECT comment_id, user_id, author_display, LEFT(message, 50) AS msg \\\n"
    "   FROM discussion_comments \\\n"
    "   ORDER BY created_at DESC LIMIT 10;\""
))

story.append(section("Step 4 &mdash; Real metrics, not hardcoded", 3))
story.append(p(
    "Navigate to <i>Observability</i>. The UPTIME and ERROR RATE values come "
    "directly from <font face='Courier'>events</font>. Show the queries in "
    "<font face='Courier'>chat_api.py</font> (sections 5.1 / 5.2 of this doc)."
))

story.append(section("Step 5 &mdash; Dashboard cards are interactive", 3))
story.append(p(
    "Click each Dashboard card &rarr; navigates to the relevant page. Quick to demonstrate."
))

story.append(section("Step 6 &mdash; Logout, then session persistence", 3))
story.append(p(
    "Log out (red button in profile menu) &rarr; back to login. Login again, "
    "navigate, then press F5: you stay logged in (sessionStorage). "
    "Close the tab and reopen: logged out (sessionStorage is per-tab)."
))

story.append(PageBreak())

# =====================================================================
# 11. SECURITY
# =====================================================================
story.append(section("11. Security notes and known limitations", 1))

story.append(p("<b>What is in place:</b>"))
sec_ok = [
    "Passwords stored as bcrypt hashes (work factor 12). Plaintext never touches the DB or logs.",
    "Parameterized SQL with <font face='Courier'>%s</font> placeholders &rarr; SQL injection safe.",
    "Generic <i>Invalid credentials</i> error &rarr; cannot enumerate accounts by error message.",
    "CORS allow-list restricted to specific origins, not <font face='Courier'>*</font>.",
    "WebSocket disconnects are cleaned up on both client and server.",
    "ErrorBoundary catches render errors instead of exposing a blank page.",
]
for line in sec_ok:
    story.append(p("&bull; " + line))

story.append(Spacer(1, 6))
story.append(p("<b>Known limitations (intentional, for the prototype scope):</b>"))
sec_warn = [
    "<b>No JWT</b> &mdash; the session is just a flag in sessionStorage. A real deployment would want a signed token sent in the <font face='Courier'>Authorization</font> header on every request, validated server-side.",
    "<b>No rate limiting</b> &mdash; brute-force protection isn't implemented. Add slowapi or a <font face='Courier'>failed_login_attempts</font> column for production.",
    "<b>No 2FA / email verification</b> &mdash; signup trusts whatever email you type.",
    "<b>Forgot password is removed but not replaced</b> &mdash; needs an email service + a <font face='Courier'>password_reset_tokens</font> table.",
    "<b>WebSocket has no auth</b> &mdash; anyone who knows a discussion_id can subscribe. For production, require a token on connect.",
    "<b>Dev runs on HTTP</b> &mdash; production must use HTTPS/WSS, otherwise passwords and tokens travel in clear.",
]
for line in sec_warn:
    story.append(p("&bull; " + line, WARN))

story.append(PageBreak())

# =====================================================================
# 12. CHANGELOG
# =====================================================================
story.append(section("12. File-by-file changelog", 1))

story.append(p("Sorted by area. Skip rows you don't need to mention in the presentation."))

story.append(section("Backend", 3))
story.append(tbl(
    [
        ["File", "Type", "Summary"],
        ["chat_api.py", "Extended",
         "+ /login, /signup endpoints with bcrypt + DB. + 5 discussions endpoints. + WebSocket /ws/discussions/{id} with _WSManager. + /metrics/observability, /metrics/resolution computed from events."],
        ["set_password.py", "New",
         "CLI: bcrypt-hash a new password and UPDATE the user row."],
        ["create_user.py", "New",
         "CLI: INSERT a new user with chosen role."],
        ["seed_discussions.py", "New",
         "CLI: idempotent seeder for the initial three threads + their comments."],
        ["migrations/003_discussions.sql", "Applied",
         "Pre-existing in the repo but not in the DB; applied via psql."],
    ],
    col_widths=[4 * cm, 2.5 * cm, 8.5 * cm], mono_col=0
))

story.append(section("Frontend &mdash; services", 3))
story.append(tbl(
    [
        ["File", "Type", "Summary"],
        ["src/services/authApi.js", "New",
         "fetch helpers loginUser / signupUser; unified JSON error extraction."],
        ["src/services/discussionsApi.js", "New",
         "fetchDiscussions / fetchDiscussionDetail / createDiscussion / postComment / changeDiscussionStatus + subscribeToDiscussion (WebSocket with reconnect)."],
        ["src/services/api.js", "Edited",
         "Added getCurrentUser / getCurrentUserId helpers. Replaced fetchObservabilityMetrics + fetchResolutionData mocks with real API calls. UpdatedUserID now reads from sessionStorage."],
    ],
    col_widths=[5.5 * cm, 2 * cm, 7.5 * cm], mono_col=0
))

story.append(section("Frontend &mdash; pages and components", 3))
story.append(tbl(
    [
        ["File", "Type", "Summary"],
        ["src/App.jsx", "Edited",
         "User state from sessionStorage + isAuthed gate. handleLogin / handleLogout. URL sync via useEffect. Wraps active page in ErrorBoundary keyed by activePage."],
        ["src/main.jsx", "Edited",
         "Wraps <App /> in <ErrorBoundary scope='root' />."],
        ["src/pages/Login.jsx", "Edited",
         "Real fetch-based handleSubmit, mode toggle (login/signup), success/error alerts, floating labels, Enter submits, Ctrl+Enter ergonomy, dead UI removed."],
        ["src/pages/Discussions.jsx", "Rewritten",
         "Fetches from backend, WebSocket subscription per opened thread, LIVE / OFFLINE badge, auto-scroll, New Topic dialog. mockIncidents deleted."],
        ["src/pages/Dashboard.jsx", "Edited",
         "Combined duplicate declaration. CARD_TARGET map makes each KPI card navigate to the right page."],
        ["src/components/Layout.jsx", "Edited",
         "Accepts user + onLogout props. Email + role next to avatar. Logout (red) replaces Login menu item. GLOBAL_TELEMETRY label renamed."],
        ["src/components/ErrorBoundary.jsx", "New",
         "Class component, getDerivedStateFromError + componentDidCatch, fallback card with Try Again / Reload / Logout + Reset buttons."],
        ["src/components/ChartWidget.jsx", "Fixed",
         "CustomTooltip no longer references out-of-scope variables; uses entry.name + unit prop. No more black-screen on hover."],
        ["src/components/AlarmFrequencyChart.jsx + others", "Edited",
         "Polling intervals bumped (5s -> 30s, 15s -> 60s) to keep the browser responsive when the backend is slow."],
    ],
    col_widths=[6 * cm, 2 * cm, 7 * cm], mono_col=0
))

story.append(section("Config", 3))
story.append(tbl(
    [
        ["File", "Change"],
        [".env",
         "DB_PORT 5432 -> 5433 (Docker external mapping)."],
        ["docker-compose.yml",
         "Untouched."],
        ["vite.config.js",
         "Untouched."],
        ["requirements.txt",
         "No source change, but bcrypt + reportlab were pip-installed."],
    ],
    col_widths=[4 * cm, 11 * cm], mono_col=0
))

story.append(Spacer(1, 12))
story.append(p(
    "<i>Document generated programmatically from the actual implementation. "
    "Update <font face='Courier'>generate_session_doc.py</font> if you change "
    "the source files; then rerun to refresh the PDF.</i>",
    NOTE
))


def build():
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=1.8 * cm, rightMargin=1.8 * cm,
        topMargin=1.8 * cm, bottomMargin=1.8 * cm,
        title="Nexus &mdash; Full Session Report",
        author="Nexus Team",
    )
    doc.build(story)
    print(f"Generated: {OUTPUT}")


if __name__ == "__main__":
    build()
