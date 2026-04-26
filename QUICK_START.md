# Quick Start Guide - AI Resume Intelligence Platform

## Overview

This is a comprehensive resume analysis platform with AI-powered insights, bias detection, and bulk processing capabilities. The application consists of a React frontend and FastAPI backend.

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- SQLite (included with Python)

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

## Backend Setup

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Create a `.env` file in the backend directory:
```env
DATABASE_URL=sqlite:///./resume_analyzer.db
SECRET_KEY=your-secret-key-here
AI_MODE=auto
FAST_MODE=false
```

### 4. Start the Server
```bash
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## First Time Usage

### 1. Access the Application
- Open `http://localhost:5173` in your browser
- You'll see the login/signup page

### 2. Create an Account
- Click "Sign Up"
- Enter email, username, and password
- Submit the form (demo mode accepts any credentials)

### 3. Upload Your Resume
- Go to "Unified Dashboard"
- Click the upload area to select a PDF or DOCX file
- Wait for parsing to complete

### 4. Analyze Your Resume
- Select your uploaded resume
- Paste a job description in the text area
- Click "Analyze Resume Match"
- View results in real-time

### 5. Explore Features

**Unified Dashboard:**
- Upload and analyze resumes
- View score breakdowns
- Read AI feedback
- Explore career intelligence

**Candidate Profile:**
- Personal resume feedback
- Career growth tracking
- Strengths and improvements
- Skill recommendations

**Recruiter Tools:**
- Analyze multiple resumes
- Compare candidates
- View bias metrics
- Make shortlisting decisions

**Bulk Analysis:**
- Analyze many resumes at once
- Filter by company (Google, Microsoft, Amazon, etc.)
- Export results as CSV
- Identify top candidates quickly

## API Endpoints

### Authentication
```
POST /api/auth/signup - Create account
POST /api/auth/login - User login
```

### Resumes
```
POST /api/resumes/upload - Upload resume
GET /api/resumes/{id} - Get resume details
GET /api/resumes/user/{user_id} - List user's resumes
```

### Analysis
```
POST /api/analysis/analyze - Analyze resume
  Request: { resume_id: int, job_description: str }
  Response: AnalysisResult with scores, feedback, intelligence data
```

### Dashboard
```
GET /api/dashboard/recruiter - Get recruiter dashboard
GET /api/dashboard/candidate/{user_id} - Get candidate feedback
GET /api/dashboard/resume/{resume_id} - Get resume details
```

## Key Features

### Analysis Capabilities
- **Skills Matching**: 0-100% match score for skills
- **Experience Scoring**: Aligns experience with job requirements
- **Education Evaluation**: Assesses educational fit
- **Overall Score**: Weighted combination of all factors

### Career Intelligence
- Substance Score: Measures actual career depth
- Role Clarity: How clear career direction is
- Skill Depth: Applied expertise vs keyword listing
- Project Intelligence: Complexity and impact of projects
- Achievement Signals: Quantified accomplishments

### Bias Detection
- Fairness Rating: High/Medium/Low
- Detected Biases: Specific bias patterns found
- Recommendations: How to address identified biases

### Bulk Features
- Multi-resume processing
- Company-specific templates
- CSV export
- Candidate ranking
- Results filtering

## Project Structure

```
ai-resume/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React Context providers
│   │   ├── services/       # API calls
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── schemas/        # Pydantic models
│   │   ├── main.py         # App entry point
│   │   └── database.py     # Database setup
│   ├── requirements.txt
│   └── .env
└── README.md
```

## Troubleshooting

### Port Already in Use
```bash
# Change frontend port
npm run dev -- --port 3000

# Change backend port
python -m uvicorn app.main:app --port 8001
```

### Database Errors
```bash
# Reset database
rm backend/resume_analyzer.db
python -m app.main
```

### Missing Dependencies
```bash
# Frontend
npm install

# Backend
pip install -r requirements.txt
```

### CORS Issues
Ensure backend is running and CORS is configured correctly in `app/main.py`

## Development Tips

### Hot Reload
- Frontend changes auto-reload with Vite
- Backend changes auto-reload with `--reload` flag

### Debugging
- Frontend: Use browser DevTools
- Backend: Check console output and logs

### Testing
- Upload various resume formats (PDF, DOCX)
- Test with different job descriptions
- Try bulk analysis with multiple files
- Check bias detection functionality

## Performance Notes

- First analysis may take 2-5 seconds (AI model loading)
- Subsequent analyses are faster (cached models)
- Bulk analysis processes resumes sequentially
- UI is responsive on desktop, tablet, and mobile

## Next Steps

1. **Customize:**
   - Update company templates in BulkAnalysisPage
   - Modify scoring weights in analyzer.py
   - Adjust UI colors in tailwind.config.js

2. **Extend:**
   - Add real database (PostgreSQL)
   - Implement JWT authentication
   - Add email notifications
   - Create admin dashboard

3. **Deploy:**
   - Frontend to Vercel
   - Backend to AWS/GCP/Heroku
   - Database to managed service
   - Enable production features

## Support & Documentation

- API Docs: `http://localhost:8000/docs`
- Component Guide: See component files with JSDoc
- Type Definitions: Check `frontend/src/types/index.ts`
- Model Schemas: Check `backend/app/schemas/__init__.py`

## License

Open-source, free to use, no limitations.

Happy analyzing!
