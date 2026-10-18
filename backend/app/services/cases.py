from datetime import datetime, timezone
from sqlalchemy import select
from backend.app.db import Base, SessionLocal, engine
from backend.app.models.db_models import Case


def initialize(_db_path=None):
    """Create current schema. _db_path is retained for compatibility with v0.1 tests."""
    Base.metadata.create_all(bind=engine)


def _serialize(row: Case) -> dict:
    created_at = row.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return {
        "id": row.id,
        "title": row.title,
        "notes": row.notes,
        "created_at": created_at.isoformat(),
    }


def create_case(title: str, notes: str, _db_path=None) -> dict:
    with SessionLocal() as session:
        row = Case(title=title, notes=notes)
        session.add(row)
        session.commit()
        session.refresh(row)
        return _serialize(row)


def list_cases(_db_path=None) -> list[dict]:
    with SessionLocal() as session:
        rows = session.scalars(select(Case).order_by(Case.id.desc())).all()
        return [_serialize(row) for row in rows]
