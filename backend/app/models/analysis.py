from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_description = Column(Text, nullable=True)
    
    # Scores
    skills_score = Column(Integer, nullable=False)
    experience_score = Column(Integer, nullable=False)
    education_score = Column(Integer, nullable=False)
    overall_score = Column(Integer, nullable=False)
    reasoning = Column(Text, nullable=True)
    
    # Bias Detection
    bias_score = Column(Float, nullable=True)
    bias_report = Column(JSON, nullable=True)
    
    # Feedback
    feedback = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)
    improvements = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    
    # Career Intelligence
    career_intelligence = Column(JSON, nullable=True)
    
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="analyses")
