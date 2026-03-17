from pydantic import BaseModel
from typing import Optional


class GrammarRequest(BaseModel):
    sentence: str
    word: Optional[str] = None
    targetLang: str
    nativeLang: str
