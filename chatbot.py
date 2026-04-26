import asyncio
import json
import os
from threading import Lock

from dotenv import load_dotenv
from fastmcp.client import Client
from openai import OpenAI

from nexus_mcp import mcp

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
MAX_HISTORY_MESSAGES = int(os.getenv("CHAT_MEMORY_MESSAGES", "8"))
MAX_RESPONSE_TOKENS = int(os.getenv("CHAT_MAX_RESPONSE_TOKENS", "320"))
RESPONSE_TEMPERATURE = float(os.getenv("CHAT_TEMPERATURE", "0.3"))


class ConversationMemory:
    def __init__(self, max_messages: int = 12):
        self.max_messages = max_messages
        self._sessions: dict[str, list[dict]] = {}
        self._lock = Lock()

    def get(self, session_id: str) -> list[dict]:
        with self._lock:
            return list(self._sessions.get(session_id, []))

    def save(self, session_id: str, messages: list[dict]) -> None:
        with self._lock:
            self._sessions[session_id] = messages[-self.max_messages :]

    def clear(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)


memory_store = ConversationMemory(max_messages=MAX_HISTORY_MESSAGES)

SYSTEM_PROMPT = (
    "You are Nexus AI. Reply in user language (default Romanian for Romanian user input, "
    "otherwise English). "
    "You are in caveman mode by default at full intensity. "
    "Respond terse like smart caveman. All technical substance stays. Fluff dies. "
    "Mode persistence: caveman mode stays active on every response until user explicitly says "
    "'stop caveman' or 'normal mode'. "
    "Intensity switching command: '/caveman lite|full|ultra|wenyan-lite|wenyan-full|wenyan-ultra'. "
    "Default intensity is full when not specified. "
    "Rules: remove filler, pleasantries, hedging. Fragments are allowed. Keep technical terms exact. "
    "Pattern: '[thing] [action] [reason]. [next step].' "
    "Intensity behavior: "
    "lite = tight full sentences; "
    "full = classic caveman fragments, short synonyms; "
    "ultra = abbreviate heavily and use arrows like X -> Y; "
    "wenyan levels = highly compressed classical Chinese style. "
    "Auto-clarity override: temporarily drop caveman style only for security warnings, irreversible "
    "actions, or multi-step sequences where terse fragments may be unsafe; then resume caveman. "
    "Never invent data. No repetition. "
    "For database facts, use tools: describe_database_schema (schema), run_readonly_sql "
    "(SELECT analytics only), get_latest_sensor_value, get_average_temperature. "
    "Ask one short clarifying question only if strictly required."
)


async def _call_mcp_tool_async(tool_name: str, args: dict) -> str:
    async with Client(mcp) as mcp_client:
        result = await mcp_client.call_tool(tool_name, args)

    if hasattr(result, "content") and result.content:
        chunks = []
        for item in result.content:
            text = getattr(item, "text", None)
            chunks.append(text if text is not None else str(item))
        return "\n".join(chunks)

    return str(result)


def call_mcp_tool(tool_name: str, args: dict) -> str:
    return asyncio.run(_call_mcp_tool_async(tool_name, args))


def _to_message_dict(message_obj) -> dict:
    if isinstance(message_obj, dict):
        return message_obj
    if hasattr(message_obj, "model_dump"):
        return message_obj.model_dump(exclude_none=True)
    return {"role": "assistant", "content": str(message_obj)}


def _history_only(messages: list) -> list[dict]:
    history = []
    for msg in messages:
        msg_dict = _to_message_dict(msg)
        if msg_dict.get("role") in {"user", "assistant"}:
            history.append(
                {"role": msg_dict.get("role"), "content": msg_dict.get("content", "")}
            )
    return history


def chat_nexus(mesaj_utilizator: str, session_id: str = "default") -> str:
    session_history = memory_store.get(session_id)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}, *session_history]
    messages.append({"role": "user", "content": mesaj_utilizator})

    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_latest_sensor_value",
                "description": "Get latest value for sensor by sensor_id.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sensor_id": {"type": "integer", "default": 1},
                    },
                    "required": [],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_average_temperature",
                "description": (
                    "Get average sensor value between timestamps. "
                    "Datetime format: YYYY-MM-DD HH:MM:SS."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start_time": {"type": "string"},
                        "end_time": {"type": "string"},
                        "sensor_id": {"type": "integer", "default": 1},
                    },
                    "required": ["start_time", "end_time"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "describe_database_schema",
                "description": "Describe database tables and columns.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "run_readonly_sql",
                "description": (
                    "Run one read-only SELECT SQL query for analytics/reporting. "
                    "No writes are allowed."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query_sql": {"type": "string"},
                        "limit": {"type": "integer", "default": 200},
                    },
                    "required": ["query_sql"],
                },
            },
        },
    ]

    printed_tool_info = False
    for _ in range(5):
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            tools=tools,
            max_tokens=MAX_RESPONSE_TOKENS,
            temperature=RESPONSE_TEMPERATURE,
        )

        response_message = response.choices[0].message
        if not response_message.tool_calls:
            answer = response_message.content or "Could not generate a response."
            memory_store.save(session_id, _history_only(messages) + [{"role": "assistant", "content": answer}])
            return answer

        if not printed_tool_info:
            print("AI is querying the database...")
            printed_tool_info = True

        messages.append(_to_message_dict(response_message))
        for tool_call in response_message.tool_calls:
            tool_name = tool_call.function.name
            tool_args = json.loads(tool_call.function.arguments or "{}")
            result = call_mcp_tool(tool_name, tool_args)
            messages.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": tool_name,
                "content": result,
            })

    fallback = "Could not complete the response after several tool-call attempts."
    memory_store.save(session_id, _history_only(messages) + [{"role": "assistant", "content": fallback}])
    return fallback


if __name__ == "__main__":
    print("Nexus Chatbot ACTIVE.")
    session_id = input("Session ID (default: cli): ").strip() or "cli"
    user_input = input("Ask Nexus: ")
    print(f"Nexus AI: {chat_nexus(user_input, session_id=session_id)}")