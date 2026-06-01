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
    if len(sys.argv) != 3:
        print("Usage: python set_password.py <email> <new_password>")
        sys.exit(1)

    email = sys.argv[1].lower().strip()
    password = sys.argv[2]

    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    with closing(psycopg2.connect(**DB_CONFIG)) as conn:
        with conn.cursor() as curr:
            curr.execute(
                "UPDATE users SET password_hash = %s, updated_dtm = NOW() "
                "WHERE email = %s RETURNING user_id",
                (pw_hash, email),
            )
            row = curr.fetchone()
            conn.commit()

    if not row:
        print(f"No user found with email {email}")
        sys.exit(2)

    print(f"Password updated for {email} (user_id={row[0]})")

if __name__ == "__main__":
    main()
