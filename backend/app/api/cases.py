from fastapi import APIRouter
from backend.app.models.schemas import CaseCreate
from backend.app.services.cases import create_case, list_cases

router = APIRouter(prefix="/api/cases", tags=["Investigations"])

@router.get("")
def get_cases():
    cases = list_cases()
    return {"cases": cases, "count": len(cases)}

@router.post("", status_code=201)
def post_case(payload: CaseCreate):
    return create_case(payload.title, payload.notes)
