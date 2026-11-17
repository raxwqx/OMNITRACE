from fastapi import APIRouter, HTTPException, Query

from backend.app.models.schemas import IndicatorCreate
from backend.app.services.indicators import (
    create_indicator,
    delete_indicator,
    indicator_summary,
    list_indicators,
)

router = APIRouter(prefix="/api/indicators", tags=["Indicator Registry"])


@router.post("", status_code=201)
def post_indicator(payload: IndicatorCreate):
    try:
        return create_indicator(payload.value, payload.note, payload.case_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("")
def get_indicators(
    case_id: int | None = Query(default=None, ge=1),
    indicator_type: str | None = Query(default=None, max_length=32),
    limit: int = Query(default=200, ge=1, le=500),
):
    items = list_indicators(case_id=case_id, indicator_type=indicator_type, limit=limit)
    return {"indicators": items, **indicator_summary(items)}


@router.delete("/{indicator_id}", status_code=204)
def remove_indicator(indicator_id: int):
    if not delete_indicator(indicator_id):
        raise HTTPException(status_code=404, detail="Indicator not found.")
    return None
