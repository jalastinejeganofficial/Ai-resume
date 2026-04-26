from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Resume, AnalysisResult
from app.schemas import DashboardResumeItem, CandidateFeedback

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/recruiter", response_model=List[DashboardResumeItem])
def get_recruiter_dashboard(db: Session = Depends(get_db)):
    """Get all analyzed resumes for recruiter dashboard"""
    
    # Get all resumes with their latest analysis
    resumes = db.query(Resume).all()
    result = []
    
    for resume in resumes:
        # Get latest analysis
        latest_analysis = db.query(AnalysisResult).filter(
            AnalysisResult.resume_id == resume.id
        ).order_by(AnalysisResult.analyzed_at.desc()).first()
        
        if latest_analysis:
            candidate_name = resume.parsed_data.get("name", "Unknown") if resume.parsed_data else "Unknown"
            
            # Check for bias flag (bias_score > 30)
            bias_flag = latest_analysis.bias_score > 30 if latest_analysis.bias_score else False
            
            result.append(DashboardResumeItem(
                id=resume.id,
                candidate_name=candidate_name,
                overall_score=latest_analysis.overall_score,
                skills_match=latest_analysis.skills_score,
                bias_flag=bias_flag,
                analyzed_at=latest_analysis.analyzed_at
            ))
    
    # Sort by overall score descending
    result.sort(key=lambda x: x.overall_score, reverse=True)
    
    return result


@router.get("/resume/{resume_id}")
def get_resume_detail(resume_id: int, db: Session = Depends(get_db)):
    """Get detailed analysis for a specific resume"""
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    latest_analysis = db.query(AnalysisResult).filter(
        AnalysisResult.resume_id == resume_id
    ).order_by(AnalysisResult.analyzed_at.desc()).first()
    
    if not latest_analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this resume")
    
    return {
        "resume": {
            "id": resume.id,
            "file_name": resume.file_name,
            "parsed_data": resume.parsed_data,
            "uploaded_at": resume.uploaded_at
        },
        "analysis": {
            "scores": {
                "skills_score": latest_analysis.skills_score,
                "experience_score": latest_analysis.experience_score,
                "education_score": latest_analysis.education_score,
                "overall_score": latest_analysis.overall_score,
                "reasoning": latest_analysis.reasoning
            },
            "bias_report": latest_analysis.bias_report,
            "feedback": latest_analysis.feedback,
            "strengths": latest_analysis.strengths,
            "improvements": latest_analysis.improvements,
            "missing_skills": latest_analysis.missing_skills,
            "suggestions": latest_analysis.suggestions,
            "analyzed_at": latest_analysis.analyzed_at
        }
    }


@router.get("/candidate/{user_id}", response_model=List[CandidateFeedback])
def get_candidate_dashboard(user_id: int, db: Session = Depends(get_db)):
    """Get feedback for a candidate's resume analyses"""
    
    # Get all resumes for this user
    resumes = db.query(Resume).filter(Resume.user_id == user_id).all()
    
    result = []
    for resume in resumes:
        # Get latest analysis
        latest_analysis = db.query(AnalysisResult).filter(
            AnalysisResult.resume_id == resume.id
        ).order_by(AnalysisResult.analyzed_at.desc()).first()
        
        if latest_analysis:
            result.append(CandidateFeedback(
                position=latest_analysis.job_description[:50] + "..." if latest_analysis.job_description else "Unknown Position",
                match_percentage=latest_analysis.overall_score,
                strengths=latest_analysis.strengths or [],
                improvements=latest_analysis.improvements or [],
                missing_skills=latest_analysis.missing_skills or [],
                suggestions=latest_analysis.suggestions or []
            ))
    
    return result
