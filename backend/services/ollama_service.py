from typing import AsyncGenerator
import httpx
import json
from config import settings


GRAMMAR_PROMPT_TEMPLATE = """You are a language tutor. The student is learning {target_lang} and speaks {native_lang}.
{video_context_section}
Analyze this sentence from a video:
"{sentence}"
{word_context}

Provide:
1. **Translation**:
   - Literal translation
   - Natural/equivalent translation in {native_lang}
   - If any word or phrase is slang, an idiom, a cultural reference, onomatopoeia, or a childish/informal expression (e.g. "neener neener", "duh", "nah nah"), do NOT treat it as a typo or mispronunciation. Instead, keep it in the literal translation and provide its real equivalent in the natural translation.

2. **Grammar**: Verb tense, mood, subject (be concise)

3. {word_analysis}

4. **Cultural context** (ALWAYS check for this):
   - Identify any idioms, slang, catchphrases, cultural references, or informal expressions
   - Explain what they really mean in context
   - If the sentence comes from a TV show, movie, or song, explain how the character or context gives it additional meaning

5. **Example**: One similar sentence using the same structure or expression

Respond in {native_lang}. Be concise but never skip cultural context."""


def build_prompt(sentence: str, word: str | None, target_lang: str, native_lang: str, video_context: str | None = None) -> str:
    word_context = f'\nThe student clicked on the word: "{word}"' if word else ""
    word_analysis = (
        f'Explanation of "{word}" in this context' if word else "Key grammar points"
    )
    video_context_section = (
        f"\nVideo context: {video_context}\nUse this context to better explain idioms, cultural references, slang, and expressions specific to this content.\n"
        if video_context
        else ""
    )
    return GRAMMAR_PROMPT_TEMPLATE.format(
        sentence=sentence,
        word_context=word_context,
        word_analysis=word_analysis,
        target_lang=target_lang,
        native_lang=native_lang,
        video_context_section=video_context_section,
    )


async def stream_grammar_explanation(
    sentence: str,
    word: str | None,
    target_lang: str,
    native_lang: str,
    video_context: str | None = None,
) -> AsyncGenerator[str, None]:
    prompt = build_prompt(sentence, word, target_lang, native_lang, video_context)

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
