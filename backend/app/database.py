# app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Se esiste una variabile d'ambiente DATABASE_URL (usata da Postgres in Docker), usa quella;
# altrimenti usa SQLite locale per sviluppo
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./devops.db")

# Argomenti speciali necessari solo per SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency per FastAPI: apre una sessione DB per ogni richiesta e la chiude alla fine
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
