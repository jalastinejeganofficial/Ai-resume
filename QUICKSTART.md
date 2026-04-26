# Quick Start Guide

## Option 1: Docker (Recommended)

### Prerequisites
- Install Docker Desktop: https://www.docker.com/products/docker-desktop

### Steps

1. **Navigate to project directory**
   ```bash
   cd "c:\Ai resume"
   ```

2. **Create .env file**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and add your Azure credentials:
   ```
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_API_KEY=your-api-key
   AZURE_DOC_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
   AZURE_DOC_INTELLIGENCE_KEY=your-api-key
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## Option 2: Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   # Create database in PostgreSQL
   createdb resume_analyzer
   ```

5. **Configure environment**
   ```bash
   copy .env.example .env
   # Edit .env with your credentials
   ```

6. **Run the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

---

## Testing the Application

### 1. Upload a Resume
- Go to Recruiter or Candidate dashboard
- Drag and drop a PDF/DOCX resume file
- Wait for parsing to complete

### 2. Analyze Against Job Description
- Select the uploaded resume
- Paste a job description
- Click "Analyze Resume"

### 3. View Results
- **Scores**: Skills, Experience, Education, Overall
- **Bias Report**: Fairness rating and detected biases
- **Feedback**: AI-generated insights and suggestions

---

## Azure Setup (If you don't have credentials)

### 1. Create Azure OpenAI Resource
1. Go to https://portal.azure.com
2. Create "Azure OpenAI" resource
3. Deploy a model (gpt-4 or gpt-35-turbo)
4. Copy endpoint and key from "Keys and Endpoint"

### 2. Create Document Intelligence Resource
1. Go to https://portal.azure.com
2. Create "Form Recognizer" / "Document Intelligence" resource
3. Copy endpoint and key from "Keys and Endpoint"

### 3. Get Free Credits
- New Azure accounts get $200 free credit
- Both services have free tiers available

---

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check Azure credentials are correct

### Frontend won't connect
- Ensure backend is running on port 8000
- Check CORS settings in backend/config.py
- Verify API base URL in frontend/vite.config.ts

### Docker issues
- Run `docker-compose down` then `docker-compose up --build`
- Check Docker Desktop is running
- Ensure ports 3000, 8000, 5432 are available

---

## Next Steps

1. **Customize scoring**: Modify prompts in `backend/app/services/analyzer.py`
2. **Add more bias checks**: Extend `backend/app/services/bias_detector.py`
3. **Style the UI**: Edit Tailwind classes in frontend components
4. **Add authentication**: Implement JWT auth system
5. **Deploy to cloud**: Use Azure Container Apps or AWS

---

**Need help?** Check the full README.md or open an issue on GitHub.
