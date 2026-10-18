from datetime import timezone
from sqlalchemy import select
from backend.app.db import SessionLocal
from backend.app.models.db_models import IdentitySearch


def record_search(username: str, platforms: list[str], result_count: int) -> dict:
    with SessionLocal() as session:
        row = IdentitySearch(username=username, platforms=platforms, result_count=result_count)
        session.add(row)
        session.commit()
        session.refresh(row)
        return serialize_search(row)


def list_searches(limit: int = 20) -> list[dict]:
    with SessionLocal() as session:
        rows = session.scalars(
            select(IdentitySearch).order_by(IdentitySearch.id.desc()).limit(limit)
        ).all()
        return [serialize_search(row) for row in rows]


def serialize_search(row: IdentitySearch) -> dict:
    created_at = row.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return {
        "id": row.id,
        "username": row.username,
        "platforms": row.platforms,
        "result_count": row.result_count,
        "created_at": created_at.isoformat(),
    }
