from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import pos_tagging, translation, grammar, youtube, pronunciation

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


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
