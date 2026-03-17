from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.grammar_models import GrammarRequest
from services.ollama_service import stream_grammar_explanation

router = APIRouter()


@router.post("/grammar")
async def grammar_endpoint(request: GrammarRequest):
    try:
        async def generate():
            async for chunk in stream_grammar_explanation(
                sentence=request.sentence,
                word=request.word,
                target_lang=request.targetLang,
                native_lang=request.nativeLang,
            ):
                yield chunk

        return StreamingResponse(generate(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
