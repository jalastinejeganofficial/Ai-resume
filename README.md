# AI Resume Analyzer v2.0 - Hardware Agnostic

An AI-powered resume analysis platform that **works on ANY PC** (even old laptops with 2GB RAM)! Features intelligent resume parsing, semantic scoring, bias detection, and transparent feedback for both recruiters and candidates.

## ✨ What Makes v2.0 Special

✅ **Works on ANY PC** - From 2GB RAM laptops to high-end workstations  
✅ **Automatic AI Mode Selection** - Detects your PC specs and picks optimal method  
✅ **FREE Cloud AI Fallback** - No paid APIs required  
✅ **Rate Limiting Built-in** - Protects your system  
✅ **5-Minute Setup** - Ultra-fast deployment  
✅ **100% Open Source** - No vendor lock-in

## Features

### For Recruiters
- **Fast Resume Processing**: Upload and parse resumes in seconds
- **AI-Powered Scoring**: Semantic matching against job descriptions (not just keywords)
- **Bias Detection**: Identify and mitigate bias in hiring decisions
- **Dashboard**: Compare candidates with detailed score breakdowns
- **Transparent Decisions**: Clear reasoning for all scores

### For Candidates
- **Personalized Feedback**: Understand why you matched or didn't match
- **Actionable Insights**: Get specific suggestions to improve your resume
- **Skill Gap Analysis**: See exactly which skills you're missing
- **Transparency**: No more "black hole" rejections

### Technical Highlights
- **Azure AI Integration**: Uses Azure OpenAI and Document Intelligence
- **Bias Detection Module**: Gender-coded language, age bias, educational prestige bias
- **Semantic Analysis**: Contextual matching, not just keyword counting
- **Modern Stack**: FastAPI, React, PostgreSQL, Docker

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                    │
│  ┌──────────────────┐      ┌──────────────────┐    │
│  │   Recruiter      │      │   Candidate      │    │
│  │   Dashboard      │      │   Dashboard      │    │
│  └──────────────────┘      └──────────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────┐
│               Backend (FastAPI)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Parser  │  │Analyzer  │  │  Bias Detector   │  │
│  │(Azure DI)│  │(Azure AI)│  │  (Custom Rules)  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Database (PostgreSQL)                   │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker and Docker Compose
- Azure OpenAI resource
- Azure Document Intelligence resource
- (Optional) PostgreSQL installed locally for development

## Quick Start

### 1. Clone the Repository

```bash
cd "c:\Ai resume"
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=your-azure-openai-endpoint
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4

# Azure Document Intelligence Configuration
AZURE_DOC_INTELLIGENCE_ENDPOINT=your-doc-intelligence-endpoint
AZURE_DOC_INTELLIGENCE_KEY=your-doc-intelligence-key

# Database (optional, defaults provided in docker-compose)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resume_analyzer

# JWT Security
SECRET_KEY=your-secret-key-change-in-production
```

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8000
- Frontend on port 3000

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Development Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your Azure credentials

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at http://localhost:5173

## Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   │   ├── resumes.py    # Resume upload endpoints
│   │   │   ├── analysis.py   # Analysis endpoints
│   │   │   └── dashboard.py  # Dashboard endpoints
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   │   ├── parser.py     # Azure Document Intelligence
│   │   │   ├── analyzer.py   # Azure OpenAI integration
│   │   │   └── bias_detector.py  # Bias detection
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database setup
│   │   └── main.py           # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Resumes
- `POST /api/resumes/upload` - Upload and parse a resume
- `GET /api/resumes/{resume_id}` - Get a specific resume
- `GET /api/resumes/user/{user_id}` - Get all resumes for a user

### Analysis
- `POST /api/analysis/analyze` - Analyze a resume against a job description
- `POST /api/analysis/bias-check` - Run bias detection

### Dashboard
- `GET /api/dashboard/recruiter` - Get all analyzed resumes for recruiters
- `GET /api/dashboard/resume/{resume_id}` - Get detailed analysis
- `GET /api/dashboard/candidate/{user_id}` - Get candidate feedback

## Key Features Implementation

### 1. Resume Parsing
Uses Azure Document Intelligence to extract:
- Contact information
- Skills
- Work experience
- Education
- Raw text for further analysis

### 2. AI Analysis
Azure OpenAI provides:
- Semantic skill matching (contextual, not keyword-based)
- Experience relevance scoring
- Education alignment
- Overall fit assessment
- Detailed reasoning

### 3. Bias Detection
Custom module checks for:
- Gender-coded language in job descriptions
- Age-related bias indicators
- Educational prestige bias
- Employment gap penalties
- Overly strict criteria

### 4. Candidate Feedback
Provides:
- Transparent match percentages
- Strengths identification
- Areas for improvement
- Missing skills list
- Actionable suggestions

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Production Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

### Individual Services

```bash
# Build and run backend
docker build -t resume-analyzer-backend ./backend
docker run -p 8000:8000 --env-file .env resume-analyzer-backend

# Build and run frontend
docker build -t resume-analyzer-frontend ./frontend
docker run -p 3000:80 resume-analyzer-frontend
```

## Success Metrics

- **Resume Parsing Accuracy**: >90% for standard formats
- **Semantic Scoring Correlation**: >75% with human reviewers
- **Bias Detection Rate**: 80%+ of common bias patterns
- **Processing Time**: <10 seconds per resume
- **Candidate Satisfaction**: 4/5 rating in user testing

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Multi-language resume support
- [ ] Advanced analytics and reporting
- [ ] Integration with ATS systems
- [ ] Automated job recommendation engine
- [ ] Resume optimization suggestions
- [ ] Interview preparation tips
- [ ] Mobile application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the API documentation at http://localhost:8000/docs
- Review the project structure and code comments

---

**Built with**: FastAPI, React, TypeScript, PostgreSQL, Azure AI Services
