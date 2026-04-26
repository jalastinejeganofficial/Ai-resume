# 🚀 AI Resume Analyzer v2.0 - Quick Reference Card

## ⚡ One-Command Start

### Docker (Recommended)
```bash
cd "c:\Ai resume" && docker-compose up --build
```

### Local
```bash
# Terminal 1
start-backend.bat

# Terminal 2
start-frontend.bat
```

---

## 🔑 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 (Docker) or http://localhost:5173 (Local) |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

---

## 📝 Essential .env Variables

```env
# Minimum (required)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resume_analyzer

# Optional (for old PCs)
AI_MODE=cloud
OPENROUTER_API_KEY=sk-or-your-key  # Get FREE from openrouter.ai

# Performance
FAST_MODE=false  # Set true for <1 sec analysis (no AI)
```

---

## 🎯 AI Modes

| Mode | RAM Required | Speed | Cost |
|------|-------------|-------|------|
| `auto` | Any | Adaptive | FREE |
| `local` | 8GB+ | 3-5 sec | FREE |
| `hybrid` | 4GB+ | 2-4 sec | FREE |
| `cloud` | 2GB+ | 3-5 sec | FREE |

---

## 🛡️ Rate Limits

| Endpoint | Limit |
|----------|-------|
| Upload | 10/min |
| Analysis | 5/min |
| Read | 30/min |

**Hit limit?** Wait 60 seconds or increase in `.env`

---

## 🔧 Common Commands

```bash
# Check system health
curl http://localhost:8000/health

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Clean rebuild
docker-compose down -v && docker-compose up --build
```

---

## 🆓 Get FREE AI API Keys

### OpenRouter (Recommended)
1. Go to https://openrouter.ai/
2. Sign up (Google/GitHub)
3. Copy API key
4. Add to `.env`: `OPENROUTER_API_KEY=sk-or-xxx`

**Free tier:** 100 requests/day

### HuggingFace
1. Go to https://huggingface.co/settings/tokens
2. Create token
3. Add to `.env`: `HUGGINGFACE_TOKEN=hf-xxx`

---

## 📊 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | Change port in docker-compose.yml |
| Database error | `docker run -d --name resume_db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15-alpine` |
| Slow on old PC | Set `AI_MODE=cloud` in .env |
| Module errors | Run `setup.bat` |
| Rate limit | Wait 60 sec or increase limits |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | Complete setup instructions |
| `CHANGES.md` | What's new in v2.0 |
| `.env.example` | All configuration options |
| `setup.bat` | Windows auto-setup |
| `docker-compose.yml` | Docker configuration |

---

## 🎯 Quick Tests

### 1. Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy", "ram_gb": X, "cpu_cores": Y}
```

### 2. Upload Resume
Use frontend UI or:
```bash
curl -X POST http://localhost:8000/api/resumes/upload \
  -F "file=@resume.pdf" -F "user_id=1"
```

### 3. Analyze
Use frontend UI or API docs at http://localhost:8000/docs

---

## 💡 Pro Tips

1. **Fastest**: `FAST_MODE=true` (<1 sec, no AI)
2. **Best accuracy**: `AI_MODE=hybrid` + OpenRouter key
3. **Old PC**: `AI_MODE=cloud` + OpenRouter key
4. **Offline**: `AI_MODE=local` (needs 8GB+ RAM)

---

**Need help?** Check `SETUP_GUIDE.md` or visit http://localhost:8000/docs
