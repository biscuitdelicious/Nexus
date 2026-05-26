"""Seed initial discussions data, replacing the frontend mock list."""
import os
from contextlib import closing

import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "nexus"),
    "user":     os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "postgres"),
    "port":     int(os.getenv("DB_PORT", "5433")),
}

SEED = [
    {
        "title": "CPU Critical Temperature Threshold Exceeded",
        "status": "OPEN",
        "author_display": "nexus_system_daemon",
        "device_label": "DB-Server-Primary-01",
        "body": (
            "Alarm automatically triggered by the telemetry system.\n\n"
            "The thermal sensor recorded a temperature of **85.4°C** "
            "(Critical threshold: 80.0°C) on the CPU package.\n\n"
            "**Recent metrics:**\n"
            "- CPU Load: 98%\n"
            "- Allocated Mem: 14.2 GB / 16.0 GB\n"
            "- Fan Speed: 3200 RPM (Max)\n\n"
            "Please investigate the processes causing this high load. "
            "If the temperature reaches 90°C, the server will initiate "
            "an emergency shutdown to prevent physical hardware damage."
        ),
        "comments": [
            ("mihai.admin", False, "I checked the running processes. It looks like a Docker container (`data-indexer-v2`) entered an infinite loop and locked up the threads. I restarted the container, but the temperature is dropping very slowly."),
            ("NEXUS_SYSTEM", True,  "SYSTEM LOG: Container `data-indexer-v2` restarted successfully by [mihai.admin]. CPU load dropped to 45%."),
            ("victor.oncall", False, "The temperature has stabilized at 72°C. It is still above the normal 65°C average. I suggest we check for dust accumulation on the heatsink or replace the thermal paste during Saturday's maintenance window."),
        ],
    },
    {
        "title": "High Latency on API Gateway",
        "status": "RESOLVED",
        "author_display": "mihai.admin",
        "device_label": "API-Gateway-02",
        "body": (
            "The API Gateway response time exceeded 2000ms for more than "
            "5 minutes. This indicates a potential DDoS attack or an "
            "unoptimized database query."
        ),
        "comments": [
            ("victor.oncall", False, "I applied rate-limiting on the search endpoint. Response times have returned to normal operating parameters (under 100ms)."),
        ],
    },
    {
        "title": "Memory Leak in Auth Service",
        "status": "OPEN",
        "author_display": "nexus_system_daemon",
        "device_label": "Auth-Node-01",
        "body": (
            "The authentication service is currently consuming 95% of the "
            "available system RAM. Immediate investigation required."
        ),
        "comments": [],
    },
]


def main():
    with closing(psycopg2.connect(**DB_CONFIG)) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM discussions")
            if cur.fetchone()[0] > 0:
                print("Discussions already seeded. Skipping.")
                return

            for d in SEED:
                cur.execute(
                    "INSERT INTO discussions (title, status, author_display, "
                    "device_label, body, creator_user_id) "
                    "VALUES (%s, %s, %s, %s, %s, 1) "
                    "RETURNING discussion_id",
                    (d["title"], d["status"], d["author_display"],
                     d["device_label"], d["body"]),
                )
                did = cur.fetchone()[0]

                for author, is_system, msg in d["comments"]:
                    cur.execute(
                        "INSERT INTO discussion_comments (discussion_id, "
                        "author_display, message, is_system) "
                        "VALUES (%s, %s, %s, %s)",
                        (did, author, msg, is_system),
                    )
            conn.commit()

    print(f"Seeded {len(SEED)} discussions.")


if __name__ == "__main__":
    main()
