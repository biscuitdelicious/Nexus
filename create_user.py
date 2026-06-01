"""Create a new user in the Nexus DB.

Usage:
    python create_user.py <email> <password> <first_name> [last_name] [role]

Examples:
    python create_user.py john@example.com secret123 John Doe user
    python create_user.py jane@example.com secret123 Jane

Defaults:
    last_name = ""
    role      = "user"
"""
import os
import sys
from contextlib import closing

import bcrypt
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


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)

    email      = sys.argv[1].lower().strip()
    password   = sys.argv[2]
    first_name = sys.argv[3]
    last_name  = sys.argv[4] if len(sys.argv) > 4 else ""
    role       = sys.argv[5] if len(sys.argv) > 5 else "user"

    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    with closing(psycopg2.connect(**DB_CONFIG)) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                print(f"User already exists: {email}")
                sys.exit(2)

            cur.execute(
                "INSERT INTO users (first_name, last_name, email, role, password_hash) "
                "VALUES (%s, %s, %s, %s, %s) RETURNING user_id",
                (first_name, last_name, email, role, pw_hash),
            )
            user_id = cur.fetchone()[0]
            conn.commit()

    print(f"Created user_id={user_id} email={email} role={role}")


if __name__ == "__main__":
    main()
