from fastapi import APIRouter, HTTPException
from models.translation_models import (
    TranslateRequest, TranslateResponse,
    TranslateBatchRequest, TranslateBatchResponse,
)
from services.translation_service import translate, translate_batch

router = APIRouter()


@router.post("/translate", response_model=TranslateResponse)
async def translate_endpoint(request: TranslateRequest):
    try:
        result = await translate(request.text, request.source, request.target)
        return TranslateResponse(translatedText=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/translate-batch", response_model=TranslateBatchResponse)
async def translate_batch_endpoint(request: TranslateBatchRequest):
    try:
        results = await translate_batch(request.texts, request.source, request.target)
        return TranslateBatchResponse(translations=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
