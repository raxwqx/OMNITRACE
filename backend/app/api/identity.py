from fastapi import APIRouter, HTTPException, Query
from backend.app.models.schemas import IdentitySearchRequest
from backend.app.services.identity.registry import find_candidates, PROVIDERS
from backend.app.services.identity.history import list_searches, record_search

router = APIRouter(prefix="/api/identity", tags=["Identity Intelligence"])

@router.get("/platforms")
def platforms():
    return {"platforms": [
        {"key": p.key, "name": p.name, "type": p.kind, "category": p.category}
        for p in PROVIDERS.values()
    ], "count": len(PROVIDERS)}

@router.post("/search")
def search_identity(payload: IdentitySearchRequest):
    try:
        results = find_candidates(payload.username, payload.platforms)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    record_search(payload.username, [item["platform"] for item in results], len(results))
    return {
        "query": payload.username,
        "count": len(results),
        "verified_accounts": 0,
        "message": "These are candidate profile links, not verified account matches.",
        "results": results,
    }

@router.get("/history")
def identity_history(limit: int = Query(default=10, ge=1, le=50)):
    items = list_searches(limit)
    return {"searches": items, "count": len(items)}
