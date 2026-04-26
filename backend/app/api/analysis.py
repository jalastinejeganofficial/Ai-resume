from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models import Resume, AnalysisResult
from app.schemas import AnalysisRequest, AnalysisResponse
from app.services.analyzer import SmartAnalyzer
from app.services.bias_detector import BiasDetector
from app.config import settings

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/analyze", response_model=AnalysisResponse)
@limiter.limit(settings.RATE_LIMIT_ANALYSIS)
def analyze_resume(
    request: Request,
    analysis_request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """Analyze a resume against a job description"""
    
    # Get resume
    resume = db.query(Resume).filter(Resume.id == analysis_request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.parsed_data:
        raise HTTPException(status_code=400, detail="Resume has not been parsed yet")
    
    # Analyze resume
    try:
        analyzer = SmartAnalyzer()
        analysis_result = analyzer.analyze_resume(
            resume_data=resume.parsed_data,
            job_description=analysis_request.job_description
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")
    
    # Run bias detection
    try:
        bias_detector = BiasDetector()
        bias_report = bias_detector.detect_bias(
            job_description=analysis_request.job_description,
            resume_data=resume.parsed_data,
            analysis_result=analysis_result
        )
    except Exception as e:
        # Bias detection failure shouldn't block the analysis
        bias_report = {
            "bias_score": 0,
            "detected_biases": [],
            "recommendations": ["Bias detection failed - please review manually"],
            "fairness_rating": "Medium"
        }
    
    # Save analysis to database
    db_analysis = AnalysisResult(
        resume_id=analysis_request.resume_id,
        job_description=analysis_request.job_description,
        skills_score=analysis_result["scores"]["skills_score"],
        experience_score=analysis_result["scores"]["experience_score"],
        education_score=analysis_result["scores"]["education_score"],
        overall_score=analysis_result["scores"]["overall_score"],
        reasoning=analysis_result.get("reasoning", ""),
        bias_score=bias_report["bias_score"],
        bias_report=bias_report,
        feedback=analysis_result.get("feedback", ""),
        strengths=analysis_result.get("strengths", []),
        improvements=analysis_result.get("improvements", []),
        missing_skills=analysis_result.get("missing_skills", []),
        suggestions=analysis_result.get("suggestions", []),
        career_intelligence=analysis_result.get("career_intelligence", {})
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    # Format response - include ALL data
    return AnalysisResponse(
        id=db_analysis.id,
        resume_id=db_analysis.resume_id,
        scores={
            "skills_score": db_analysis.skills_score,
            "experience_score": db_analysis.experience_score,
            "education_score": db_analysis.education_score,
            "overall_score": db_analysis.overall_score,
            "reasoning": db_analysis.reasoning
        },
        career_intelligence=db_analysis.career_intelligence or {},
        bias_report=bias_report,
        feedback=db_analysis.feedback,
        strengths=db_analysis.strengths or [],
        improvements=db_analysis.improvements or [],
        missing_skills=db_analysis.missing_skills or [],
        suggestions=db_analysis.suggestions or [],
        analyzed_at=db_analysis.analyzed_at
    )


@router.post("/bias-check")
def check_bias(
    resume_id: int,
    job_description: str,
    db: Session = Depends(get_db)
):
    """Run bias detection on a resume analysis"""
    
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Get latest analysis if exists
    latest_analysis = db.query(AnalysisResult).filter(
        AnalysisResult.resume_id == resume_id
    ).order_by(AnalysisResult.analyzed_at.desc()).first()
    
    try:
        bias_detector = BiasDetector()
        bias_report = bias_detector.detect_bias(
            job_description=job_description,
            resume_data=resume.parsed_data,
            analysis_result={
                "missing_skills": latest_analysis.missing_skills if latest_analysis else [],
                "feedback": latest_analysis.feedback if latest_analysis else ""
            }
        )
        return bias_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bias detection failed: {str(e)}")
