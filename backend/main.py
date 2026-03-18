import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from routers import pos_tagging, translation, grammar, youtube, pronunciation, upload

app = FastAPI(title="LinguaPlayer API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pos_tagging.router, prefix="/api")
app.include_router(translation.router, prefix="/api")
app.include_router(grammar.router, prefix="/api")
app.include_router(youtube.router, prefix="/api")
app.include_router(pronunciation.router, prefix="/api")
app.include_router(upload.router, prefix="/api")

# Serve processed videos as static files
processed_dir = os.path.join(os.path.dirname(__file__), "uploads", "processed")
app.mount("/uploads", StaticFiles(directory=processed_dir), name="uploads")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
