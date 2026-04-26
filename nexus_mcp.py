import os
import re
from contextlib import closing
from datetime import datetime

import psycopg2
from dotenv import load_dotenv
from fastmcp import FastMCP

load_dotenv()

mcp = FastMCP("Nexus_TimescaleDB")

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "nexus"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "postgres"),
    "port": int(os.getenv("DB_PORT", "5432")),
}


def _db_candidates():
    yield DB_CONFIG
    legacy = {
        "host": "127.0.0.1",
        "database": "nexus",
        "user": "postgres",
        "password": "postgres",
        "port": 5433,
    }
    if legacy != DB_CONFIG:
        yield legacy


def _connect():
    last_error = None
    for config in _db_candidates():
        try:
            return psycopg2.connect(**config)
        except Exception as exc:
            last_error = exc
    raise last_error


def _run_query(query: str, params: tuple, fetch_one: bool = False):
    with closing(_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if fetch_one:
                return cur.fetchone()
            return cur.fetchall()


def _is_safe_select_query(query_sql: str) -> tuple[bool, str]:
    sql = query_sql.strip()
    normalized = re.sub(r"\s+", " ", sql).lower()

    if not normalized.startswith("select"):
        return False, "Only SELECT queries are allowed."
    if ";" in normalized[:-1]:
        return False, "Multiple SQL statements are not allowed."

    forbidden = [
        " insert ",
        " update ",
        " delete ",
        " drop ",
        " alter ",
        " truncate ",
        " create ",
        " grant ",
        " revoke ",
        " call ",
        " execute ",
        " copy ",
    ]
    wrapped = f" {normalized} "
    for token in forbidden:
        if token in wrapped:
            return False, f"Forbidden SQL keyword detected: {token.strip().upper()}."

    return True, ""


@mcp.tool()
def get_latest_sensor_value(sensor_id: int = 1) -> str:
    """
    Return latest measurement for sensor from sensor_readings table.
    """
    try:
        row = _run_query(
            """
            SELECT time, value
            FROM sensor_readings
            WHERE sensor_id = %s
            ORDER BY time DESC
            LIMIT 1
            """,
            (sensor_id,),
            fetch_one=True,
        )
        if not row:
            return f"No data found for sensor_id={sensor_id}."

        timestamp, value = row
        if isinstance(timestamp, datetime):
            timestamp = timestamp.isoformat(sep=" ", timespec="seconds")
        return f"Latest value for sensor_id={sensor_id} is {value} at {timestamp}."
    except Exception as exc:
        return f"Database error: {exc}"


@mcp.tool()
def get_average_temperature(start_time: str, end_time: str, sensor_id: int = 1) -> str:
    """
    Return average temperature between timestamps for one sensor.
    start_time/end_time format: YYYY-MM-DD HH:MM:SS
    """
    try:
        row = _run_query(
            """
            SELECT AVG(value)
            FROM sensor_readings
            WHERE sensor_id = %s
              AND time >= %s::timestamp
              AND time <= %s::timestamp
            """,
            (sensor_id, start_time, end_time),
            fetch_one=True,
        )
        avg_value = row[0] if row else None
        if avg_value is None:
            return (
                f"No temperature data for sensor_id={sensor_id} between "
                f"{start_time} and {end_time}."
            )
        return (
            f"Average temperature for sensor_id={sensor_id} between "
            f"{start_time} and {end_time} is {float(avg_value):.2f}."
        )
    except Exception as exc:
        return f"Database error: {exc}"


@mcp.tool()
def describe_database_schema() -> str:
    """
    Return schema metadata for user tables and columns.
    """
    try:
        rows = _run_query(
            """
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
            """,
            (),
        )
        if not rows:
            return "No public tables found."

        lines = []
        current_table = None
        for table_name, column_name, data_type in rows:
            if table_name != current_table:
                lines.append(f"\nTable: {table_name}")
                current_table = table_name
            lines.append(f"- {column_name} ({data_type})")
        return "\n".join(lines).strip()
    except Exception as exc:
        return f"Database error: {exc}"


@mcp.tool()
def run_readonly_sql(query_sql: str, limit: int = 200) -> str:
    """
    Execute read-only SQL SELECT query. Returns rows as text.
    """
    try:
        safe, reason = _is_safe_select_query(query_sql)
        if not safe:
            return f"Rejected query: {reason}"

        hard_limit = max(1, min(limit, 500))
        final_query = (
            "SELECT * FROM (" + query_sql.strip().rstrip(";") + f") AS q LIMIT {hard_limit}"
        )
        rows = _run_query(final_query, ())
        return str(rows)
    except Exception as exc:
        return f"Database error: {exc}"


if __name__ == "__main__":
    mcp.run()