from pydantic import BaseModel


class TranslateRequest(BaseModel):
    text: str
    source: str
    target: str


class TranslateResponse(BaseModel):
    translatedText: str


class TranslateBatchRequest(BaseModel):
    texts: list[str]
    source: str
    target: str


class TranslateBatchResponse(BaseModel):
    translations: list[str]
