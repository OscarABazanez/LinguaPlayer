from pydantic import BaseModel


class POSToken(BaseModel):
    text: str
    pos: str
    lemma: str


class POSRequest(BaseModel):
    text: str
    lang: str


class POSResponse(BaseModel):
    tokens: list[POSToken]


class POSBatchRequest(BaseModel):
    segments: list[dict]
    lang: str


class POSBatchResponse(BaseModel):
    results: list[list[POSToken]]
