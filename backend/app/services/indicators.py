"""Case-linked indicator registry with automatic type classification."""
from __future__ import annotations

from datetime import timezone

from sqlalchemy import func, select

from backend.app.db import SessionLocal
from backend.app.models.db_models import Case, Indicator

MAX_VALUE_LENGTH = 2048
MAX_NOTE_LENGTH = 2000


def _clean_value(value: str) -> str:
    cleaned = (value or "").strip()
    if not cleaned:
        raise ValueError("Indicator cannot be blank.")
    if len(cleaned) > MAX_VALUE_LENGTH:
        raise ValueError(f"Indicator must be {MAX_VALUE_LENGTH} characters or fewer.")
    return cleaned


def _clean_note(note: str) -> str:
    cleaned = (note or "").strip()
    if len(cleaned) > MAX_NOTE_LENGTH:
        raise ValueError(f"Note must be {MAX_NOTE_LENGTH} characters or fewer.")
    return cleaned


def serialize_indicator(row: Indicator, case_title: str | None = None) -> dict:
    created_at = row.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return {
        "id": row.id,
        "value": row.value,
        "indicator_type": row.indicator_type,
        "note": row.note,
        "case_id": row.case_id,
        "case_title": case_title,
        "created_at": created_at.isoformat(),
    }


def create_indicator(value: str, note: str = "", case_id: int | None = None) -> dict:
    """Classify and persist an indicator, returning duplicates instead of failing."""
    from backend.app.api.intel import classify_indicator

    value = _clean_value(value)
    note = _clean_note(note)
    classification = classify_indicator(value)
    indicator_type = classification.get("type", "unknown")
    if indicator_type == "unknown":
        raise ValueError(classification.get("error") or "Indicator type is not recognized.")

    with SessionLocal() as session:
        case_title = None
        if case_id is not None:
            case = session.get(Case, case_id)
            if case is None:
                raise ValueError("Case not found.")
            case_title = case.title

        query = select(Indicator).where(func.lower(Indicator.value) == value.casefold())
        if case_id is None:
            query = query.where(Indicator.case_id.is_(None))
        else:
            query = query.where(Indicator.case_id == case_id)
        existing = session.scalars(query).first()
        if existing is not None:
            return {**serialize_indicator(existing, case_title), "duplicate": True}

        row = Indicator(value=value, indicator_type=indicator_type, note=note, case_id=case_id)
        session.add(row)
        session.commit()
        session.refresh(row)
        return {**serialize_indicator(row, case_title), "duplicate": False}


def list_indicators(
    case_id: int | None = None,
    indicator_type: str | None = None,
    limit: int = 200,
) -> list[dict]:
    with SessionLocal() as session:
        query = (
            select(Indicator, Case.title)
            .outerjoin(Case, Case.id == Indicator.case_id)
            .order_by(Indicator.id.desc())
            .limit(limit)
        )
        if case_id is not None:
            query = query.where(Indicator.case_id == case_id)
        if indicator_type:
            query = query.where(Indicator.indicator_type == indicator_type)
        return [
            {**serialize_indicator(row, case_title), "duplicate": False}
            for row, case_title in session.execute(query).all()
        ]


def indicator_summary(items: list[dict]) -> dict:
    counts: dict[str, int] = {}
    for item in items:
        counts[item["indicator_type"]] = counts.get(item["indicator_type"], 0) + 1
    return {"count": len(items), "counts_by_type": counts}


def delete_indicator(indicator_id: int) -> bool:
    with SessionLocal() as session:
        row = session.get(Indicator, indicator_id)
        if row is None:
            return False
        session.delete(row)
        session.commit()
        return True
