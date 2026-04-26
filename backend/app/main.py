from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import engine, Base
from app.models import User, Resume, AnalysisResult
from app.api import resumes, analysis, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AI Resume Analyzer",
    description="AI-powered resume analysis with bias detection and semantic scoring - Works on ANY PC!",
    version="2.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resumes.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)


@app.get("/")
@limiter.limit(settings.RATE_LIMIT_GENERAL)
def root(request: Request):
    return {
        "message": "AI Resume Analyzer API - Hardware Agnostic",
        "version": "2.0.0",
        "features": [
            "Works on any PC (even 2GB RAM)",
            "Automatic AI mode selection",
            "Rate limiting enabled",
            "FREE cloud AI fallback"
        ]
    }


@app.get("/health")
@limiter.limit("60/minute")
def health_check(request: Request):
    import psutil
    return {
        "status": "healthy",
        "ram_gb": round(psutil.virtual_memory().total / (1024**3), 1),
        "cpu_cores": psutil.cpu_count()
    }
