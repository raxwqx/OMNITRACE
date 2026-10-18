from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import APP_NAME, APP_VERSION
from backend.app.api.identity import router as identity_router
from backend.app.api.cases import router as cases_router
from backend.app.api.intel import router as intel_router
from backend.app.services.cases import initialize

BASE_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIR = BASE_DIR / "frontend"

@asynccontextmanager
async def lifespan(_app: FastAPI):
    initialize()
    yield

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Public-source OSINT investigation workspace. Candidate links are not verified identities.",
    lifespan=lifespan,
)
app.include_router(identity_router)
app.include_router(cases_router)
app.include_router(intel_router)
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

@app.get("/api/health", tags=["System"])
def health():
    return {"status": "ok", "service": APP_NAME, "version": APP_VERSION}

@app.get("/", include_in_schema=False)
def index():
    return FileResponse(FRONTEND_DIR / "index.html")
