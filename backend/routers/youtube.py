from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.youtube_service import extract_audio

router = APIRouter()


class YouTubeRequest(BaseModel):
    url: str


@router.post("/youtube-audio")
async def youtube_audio_endpoint(request: YouTubeRequest):
    try:
        audio_path = await extract_audio(request.url)
        return FileResponse(
            str(audio_path),
            media_type="audio/wav",
            filename="audio.wav",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
