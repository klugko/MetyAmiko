from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.cvs import router as cvs_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.matching import router as matching_router
from app.api.v1.offers import router as offers_router
from app.api.v1.skills import router as skills_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered recruitment assistant - CV screening & job matching",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(offers_router, prefix=API_PREFIX)
app.include_router(cvs_router, prefix=API_PREFIX)
app.include_router(matching_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(skills_router, prefix=API_PREFIX)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
