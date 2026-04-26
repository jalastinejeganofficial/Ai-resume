import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models import Resume, AnalysisResult, User
from app.schemas import ResumeResponse, AnalysisResponse, AnalysisRequest
from app.services.parser import ResumeParser
from app.services.analyzer import SmartAnalyzer
from app.services.bias_detector import BiasDetector
from datetime import datetime
from app.config import settings

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/resumes", tags=["resumes"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=ResumeResponse)
@limiter.limit(settings.RATE_LIMIT_UPLOAD)
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """Upload and parse a resume file"""
    
    # Validate file type
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{datetime.now().timestamp()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Parse resume
    try:
        parser = ResumeParser()
        parsed_data = parser.parse_resume(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
    
    # Save to database
    db_resume = Resume(
        user_id=user_id,
        file_name=file.filename,
        file_path=file_path,
        parsed_data=parsed_data
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume


@router.get("/{resume_id}", response_model=ResumeResponse)
@limiter.limit(settings.RATE_LIMIT_READ)
def get_resume(request: Request, resume_id: int, db: Session = Depends(get_db)):
    """Get a specific resume"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/user/{user_id}", response_model=list[ResumeResponse])
@limiter.limit(settings.RATE_LIMIT_READ)
def get_user_resumes(request: Request, user_id: int, db: Session = Depends(get_db)):
    """Get all resumes for a user"""
    resumes = db.query(Resume).filter(Resume.user_id == user_id).all()
    return resumes
