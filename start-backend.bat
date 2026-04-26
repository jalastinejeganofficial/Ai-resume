@echo off
echo ========================================
echo   AI Resume Analyzer v2.0 - Start
echo ========================================
echo.

echo Starting backend server...
echo Backend will run on: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop
echo.

cd backend
uvicorn app.main:app --reload --port 8000
