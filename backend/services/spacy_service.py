import spacy
from config import settings

_loaded_models: dict[str, spacy.Language] = {}


def get_model(lang: str) -> spacy.Language:
    if lang in _loaded_models:
        return _loaded_models[lang]

    model_name = settings.spacy_models.get(lang)
    if not model_name:
        raise ValueError(f"No spaCy model configured for language: {lang}")

    try:
        nlp = spacy.load(model_name)
    except OSError:
        raise RuntimeError(
            f"spaCy model '{model_name}' not installed. "
            f"Run: python -m spacy download {model_name}"
        )

    _loaded_models[lang] = nlp
    return nlp


def pos_tag(text: str, lang: str) -> list[dict]:
    nlp = get_model(lang)
    doc = nlp(text)
    return [
        {"text": token.text, "pos": token.pos_, "lemma": token.lemma_}
        for token in doc
    ]
