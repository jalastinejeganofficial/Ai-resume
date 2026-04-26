from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./resume_analyzer.db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"
    
    # Cloud AI Fallback (FREE - for old PCs)
    OPENROUTER_API_KEY: Optional[str] = None  # FREE: https://openrouter.ai/
    HUGGINGFACE_TOKEN: Optional[str] = None   # FREE: https://huggingface.co/settings/tokens
    OPENAI_API_KEY: Optional[str] = None      # Optional: For OpenAI compatibility
    
    # AI Mode Selection
    AI_MODE: str = "auto"  # "auto", "local", "cloud", "hybrid"
    
    # Rate Limiting
    RATE_LIMIT_UPLOAD: str = "10/minute"
    RATE_LIMIT_ANALYSIS: str = "5/minute"
    RATE_LIMIT_READ: str = "30/minute"
    RATE_LIMIT_GENERAL: str = "100/minute"
    
    # Performance
    FAST_MODE: bool = False  # Skip AI for ultra-fast analysis
    SEMANTIC_MODEL: str = "all-MiniLM-L6-v2"  # Lightweight model
    
    # App
    DEBUG: bool = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
