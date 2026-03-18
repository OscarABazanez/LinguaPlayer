# LinguaPlayer

Interactive video language learning app. Upload a video or paste a YouTube URL, get auto-generated subtitles with word-level timing, and practice vocabulary, grammar, and pronunciation.

## Requirements

- **Node.js** >= 18
- **Python** >= 3.10
- **ffmpeg** (required by yt-dlp for YouTube audio extraction)
- **LM Studio** (or compatible OpenAI-format LLM server) running on `http://127.0.0.1:1234`
- **LibreTranslate** running on `http://localhost:5000` (for translations)

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy language models (install the ones you need)
python -m spacy download en_core_web_sm
python -m spacy download es_core_news_sm
python -m spacy download fr_core_news_sm
python -m spacy download de_core_news_sm
python -m spacy download it_core_news_sm
python -m spacy download pt_core_news_sm
python -m spacy download ja_core_news_sm
python -m spacy download ko_core_news_sm
python -m spacy download zh_core_web_sm
python -m spacy download ru_core_news_sm

# Start the server
uvicorn main:app --reload --port 8000
```

The backend runs on `http://localhost:8000`.

### Notes on optional dependencies

- **epitran**: Provides IPA phonetic analysis for pronunciation practice. It requires a C compiler to build. If installation fails, the app will still work — pronunciation scoring will use text-based comparison only (without IPA).
- **yt-dlp**: Required for YouTube URL support. Also needs `ffmpeg` installed and available in PATH.

## Environment Variables

All backend settings can be overridden with the `LINGUA_` prefix:

| Variable | Default | Description |
|---|---|---|
| `LINGUA_CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins |
| `LINGUA_LIBRETRANSLATE_URL` | `http://localhost:5000` | LibreTranslate server URL |
| `LINGUA_LLM_URL` | `http://127.0.0.1:1234` | LM Studio / LLM server URL |
| `LINGUA_LLM_MODEL` | `qwen/qwen3-vl-4b` | LLM model name |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/pos` | POS tagging with spaCy |
| `POST` | `/api/translate` | Text translation |
| `POST` | `/api/grammar` | Grammar explanation (streaming) |
| `POST` | `/api/youtube-audio` | Extract audio from YouTube URL |
| `POST` | `/api/pronunciation/analyze` | Pronunciation analysis with IPA |
| `POST` | `/api/upload` | Upload video file |
| `POST` | `/api/upload/mark-processed` | Move video from raw to processed |
| `GET` | `/api/upload/files` | List processed video files |

## Project Structure

```
aprender/
├── frontend/          # React + TypeScript + Vite
│   └── src/
│       ├── components/   # UI components (player, sidebar, pronunciation, etc.)
│       ├── hooks/        # Custom React hooks
│       ├── services/     # API clients (whisper, grammar, upload, etc.)
│       ├── stores/       # App state management
│       ├── types/        # TypeScript type definitions
│       └── db/           # IndexedDB (Dexie) database
├── backend/           # FastAPI + Python
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic (spaCy, epitran, LLM, etc.)
│   ├── models/           # Pydantic request/response models
│   └── uploads/          # Video file storage
│       ├── raw/          # Uploaded, not yet transcribed
│       └── processed/    # Transcribed and ready
└── README.md
```
