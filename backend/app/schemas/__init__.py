from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    role: str = "candidate"  # "candidate" or "recruiter"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Resume Schemas
class ResumeUpload(BaseModel):
    job_description: Optional[str] = None


class ResumeParsed(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = []
    experience: list[dict] = []
    education: list[dict] = []
    raw_text: str


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    parsed_data: dict
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


# Analysis Schemas
class AnalysisRequest(BaseModel):
    resume_id: int
    job_description: str


class ScoreBreakdown(BaseModel):
    skills_score: int
    experience_score: int
    education_score: int
    overall_score: int
    reasoning: str


class BiasReport(BaseModel):
    bias_score: float
    detected_biases: list[str] = []
    recommendations: list[str] = []
    fairness_rating: str  # "High", "Medium", "Low"


class CareerIntelligence(BaseModel):
    role_clarity: int
    skill_depth: int
    project_intelligence: int
    achievement_signals: int
    substance_score: int
    career_level: str
    growth_trajectory: str


class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    scores: ScoreBreakdown
    career_intelligence: Optional[dict] = {}
    bias_report: BiasReport
    feedback: str
    strengths: list[str] = []
    improvements: list[str] = []
    missing_skills: list[str] = []
    suggestions: list[str] = []
    analyzed_at: datetime
    
    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardResumeItem(BaseModel):
    id: int
    candidate_name: str
    overall_score: int
    skills_match: int
    bias_flag: bool
    analyzed_at: datetime


class CandidateFeedback(BaseModel):
    position: str
    match_percentage: int
    strengths: list[str] = []
    improvements: list[str] = []
    missing_skills: list[str] = []
    suggestions: list[str] = []
