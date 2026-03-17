from pydantic import BaseModel
from typing import Optional


class PronunciationRequest(BaseModel):
    original_text: str
    spoken_text: str
    language: str


class WordComparisonResult(BaseModel):
    original: str
    spoken: Optional[str] = None
    original_ipa: str
    spoken_ipa: Optional[str] = None
    phonetic_score: float  # 0-1


class PronunciationResponse(BaseModel):
    word_comparisons: list[WordComparisonResult]
