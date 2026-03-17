from typing import AsyncGenerator
import httpx
import json
from config import settings


GRAMMAR_PROMPT_TEMPLATE = """You are a language tutor. The student is learning {target_lang} and speaks {native_lang}.

Analyze this sentence from a video:
"{sentence}"
{word_context}
Provide:
1. Literal and natural translation
2. Grammatical analysis (verb tense, mood, subject)
3. {word_analysis}
4. Idiomatic expressions if any
5. One similar example sentence

Respond in {native_lang}. Be concise."""


def build_prompt(sentence: str, word: str | None, target_lang: str, native_lang: str) -> str:
    word_context = f'\nThe student clicked on the word: "{word}"' if word else ""
    word_analysis = (
        f'Explanation of "{word}" in this context' if word else "Key grammar points"
    )
    return GRAMMAR_PROMPT_TEMPLATE.format(
        sentence=sentence,
        word_context=word_context,
        word_analysis=word_analysis,
        target_lang=target_lang,
        native_lang=native_lang,
    )


async def stream_grammar_explanation(
    sentence: str,
    word: str | None,
    target_lang: str,
    native_lang: str,
) -> AsyncGenerator[str, None]:
    prompt = build_prompt(sentence, word, target_lang, native_lang)

    # LM Studio uses OpenAI-compatible API at /v1/chat/completions
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            f"{settings.llm_url}/v1/chat/completions",
            json={
                "model": settings.llm_model,
                "messages": [{"role": "user", "content": prompt}],
                "stream": True,
                "temperature": 0.7,
                "max_tokens": 1024,
            },
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line:
                    continue
                # SSE format: "data: {...}"
                if line.startswith("data: "):
                    data_str = line[6:]
                    if data_str.strip() == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except (json.JSONDecodeError, IndexError):
                        continue
