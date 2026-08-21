import psycopg2
from typing import Any
from database import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS scan_results (
    id               SERIAL PRIMARY KEY,
    scanned_at       TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    target_file      TEXT              NOT NULL,
    route_method     TEXT              NOT NULL,
    route_path       TEXT              NOT NULL,
    route_function   TEXT              NOT NULL,
    semgrep_rule_id  TEXT,
    semgrep_file     TEXT,
    semgrep_line     INTEGER,
    semgrep_message  TEXT,
    severity         TEXT              DEFAULT 'INFO',
    k6_avg_duration  DOUBLE PRECISION,
    k6_p90_duration  DOUBLE PRECISION,
    k6_p95_duration  DOUBLE PRECISION,
    k6_req_failed    DOUBLE PRECISION,
    k6_rps           DOUBLE PRECISION
);
"""

INSERT_SQL = """
INSERT INTO scan_results (
    scanned_at, target_file, route_method, route_path, route_function,
    semgrep_rule_id, semgrep_file, semgrep_line, semgrep_message, severity,
    k6_avg_duration, k6_p90_duration, k6_p95_duration, k6_req_failed, k6_rps
)
VALUES (
    %(scanned_at)s, %(target_file)s, %(route_method)s, %(route_path)s, %(route_function)s,
    %(semgrep_rule_id)s, %(semgrep_file)s, %(semgrep_line)s, %(semgrep_message)s, %(severity)s,
    %(k6_avg_duration)s, %(k6_p90_duration)s, %(k6_p95_duration)s, %(k6_req_failed)s, %(k6_rps)s
)
RETURNING id;
"""


def _get_connection():
    return psycopg2.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
    )


def ensure_table_exists():
    conn = _get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(CREATE_TABLE_SQL)
        print("[DB] scan_results table is ready.")
    finally:
        conn.close()


def inject_report(rows: list[dict[str, Any]]) -> list[int]:
    if not rows:
        print("[DB] No rows to insert.")
        return []
    inserted_ids = []
    conn = _get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                for row in rows:
                    cur.execute(INSERT_SQL, row)
                    result = cur.fetchone()
                    if result:
                        inserted_ids.append(result[0])
        print(f"[DB] Inserted {len(inserted_ids)} row(s). IDs: {inserted_ids}")
    except Exception as exc:
        print(f"[DB] Injection failed: {exc}")
        raise
    finally:
        conn.close()
    return inserted_ids
