from fastapi import APIRouter, HTTPException
from models.pos_models import POSRequest, POSResponse, POSBatchRequest, POSBatchResponse, POSToken
from services.spacy_service import pos_tag

router = APIRouter()


@router.post("/pos-tag", response_model=POSResponse)
async def pos_tag_endpoint(request: POSRequest):
    try:
        tokens = pos_tag(request.text, request.lang)
        return POSResponse(tokens=[POSToken(**t) for t in tokens])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/pos-tag-batch", response_model=POSBatchResponse)
async def pos_tag_batch_endpoint(request: POSBatchRequest):
    try:
        results = []
        for segment in request.segments:
            text = segment.get("text", "")
            tokens = pos_tag(text, request.lang)
            results.append([POSToken(**t) for t in tokens])
        return POSBatchResponse(results=results)
    except (ValueError, RuntimeError) as e:
        raise HTTPException(status_code=400, detail=str(e))
