import httpx
from config import settings


async def translate(text: str, source: str, target: str) -> str:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.post(
                f"{settings.libretranslate_url}/translate",
                json={"q": text, "source": source, "target": target, "format": "text"},
            )
            res.raise_for_status()
            return res.json()["translatedText"]
        except (httpx.HTTPError, KeyError):
            # Fallback to MyMemory API
            return await translate_mymemory(client, text, source, target)


async def translate_mymemory(
    client: httpx.AsyncClient, text: str, source: str, target: str
) -> str:
    try:
        res = await client.get(
            "https://api.mymemory.translated.net/get",
            params={"q": text, "langpair": f"{source}|{target}"},
        )
        res.raise_for_status()
        data = res.json()
        return data.get("responseData", {}).get("translatedText", text)
    except httpx.HTTPError:
        return text


async def translate_batch(texts: list[str], source: str, target: str) -> list[str]:
    results = []
    for text in texts:
        translated = await translate(text, source, target)
        results.append(translated)
    return results
