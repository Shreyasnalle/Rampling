import psycode2 
from psycode2.extension import ISOLATION_LEVEL_AUTOCOMMIT 
from sqlalchemy import create_engine 
from sqlalchemy.orm import sessionmaker, declarative_base

DB_USER = "postgress"
DB_PASSWORD = "postgress"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "rampling"

def create_database_if_not_exists() :
    conn = psycode2.connect(
        user = DB_USER,
        pssword = DB_PASSWORD,
        host = DB_HOST,
        port = DB_PORT,
        dbname = "postgress"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.coursor()
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME))
    exists = cursor.fetchone()
    if not exists :
        cursor.execute(f"CREATE DATABASE {DB_NAME}")
        print(f"Database {DB_NAME} created")
    else :
        print(f"Database {DB_NAME} already exists")
    cursor.close()
    conn.close()

DATABASE_URL = f"postgresql://{DB_NAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind = engine)
Base = declarative_base()

def get_db() :
    db = SessionLocal()
    try :
        yield db
    finally :
        db.close()