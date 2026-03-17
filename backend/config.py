from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cors_origins: list[str] = ["http://localhost:5173"]
    libretranslate_url: str = "http://localhost:5000"
    llm_url: str = "http://127.0.0.1:1234"
    llm_model: str = "qwen/qwen3-vl-4b"

    spacy_models: dict[str, str] = {
        "en": "en_core_web_sm",
        "es": "es_core_news_sm",
        "fr": "fr_core_news_sm",
        "de": "de_core_news_sm",
        "it": "it_core_news_sm",
        "pt": "pt_core_news_sm",
        "ja": "ja_core_news_sm",
        "ko": "ko_core_news_sm",
        "zh": "zh_core_web_sm",
        "ru": "ru_core_news_sm",
    }

    class Config:
        env_prefix = "LINGUA_"


settings = Settings()
