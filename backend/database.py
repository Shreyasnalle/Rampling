import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ── Connection config ────────────────────────────────────────────────────────
DB_USER     = "postgres"
DB_PASSWORD = "postgres"
DB_HOST     = "localhost"
DB_PORT     = "5432"
DB_NAME     = "rampling"

# ── Ensure the database exists ───────────────────────────────────────────────
def create_database_if_not_exists() -> None:
    """
    Connects to the default 'postgres' maintenance DB and creates the
    'rampling' database if it does not already exist.
    """
    conn = psycopg2.connect(
        user     = DB_USER,
        password = DB_PASSWORD,
        host     = DB_HOST,
        port     = DB_PORT,
        dbname   = "postgres",          # connect to maintenance DB first
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    # (DB_NAME,) — trailing comma makes this a tuple, required by psycopg2
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    exists = cursor.fetchone()

    if not exists:
        cursor.execute(f'CREATE DATABASE "{DB_NAME}"')
        print(f"[DB] Database '{DB_NAME}' created.")
    else:
        print(f"[DB] Database '{DB_NAME}' already exists.")

    cursor.close()
    conn.close()

# ── SQLAlchemy engine & session ──────────────────────────────────────────────
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine       = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base         = declarative_base()

# ── FastAPI / dependency-injection helper ────────────────────────────────────
def get_db():
    """
    Yields a SQLAlchemy session and guarantees it is closed afterwards.
    Use as a FastAPI dependency: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()