@echo off
echo ========================================
echo   AI Resume Analyzer v2.0 - Setup
echo ========================================
echo.

echo [1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! Please install Python 3.11+
    pause
    exit /b 1
)
echo OK: Python installed
echo.

echo [2/4] Navigating to backend directory...
cd backend

echo [3/4] Installing dependencies...
echo This may take 2-3 minutes on first run...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Installation failed!
    pause
    exit /b 1
)
echo OK: Dependencies installed
echo.

echo [4/4] Downloading NLP model...
python -m spacy download en_core_web_sm
echo OK: NLP model downloaded
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Setup PostgreSQL database
echo 2. Copy .env.example to .env and configure
echo 3. Run: start.bat
echo.
pause
