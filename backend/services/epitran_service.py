"""
Epitran-based IPA phonetic transcription and similarity scoring.
"""
try:
    import epitran
    _HAS_EPITRAN = True
except ImportError:
    _HAS_EPITRAN = False

# Cache Epitran instances per language (they're expensive to create)
_epitran_cache: dict = {}

# Map from ISO 639-1 codes to Epitran language codes
LANG_MAP: dict[str, str] = {
    'en': 'eng-Latn',
    'es': 'spa-Latn',
    'fr': 'fra-Latn',
    'de': 'deu-Latn',
    'it': 'ita-Latn',
    'pt': 'por-Latn',
    'nl': 'nld-Latn',
    'tr': 'tur-Latn',
    'pl': 'pol-Latn',
    'sv': 'swe-Latn',
    'ro': 'ron-Latn',
    'cs': 'ces-Latn',
    'hu': 'hun-Latn',
}


def _get_epitran(lang: str):
    """Get or create a cached Epitran instance for the given language."""
    if not _HAS_EPITRAN:
        return None
    code = LANG_MAP.get(lang, 'eng-Latn')
    if code not in _epitran_cache:
        _epitran_cache[code] = epitran.Epitran(code)
    return _epitran_cache[code]


def get_ipa(text: str, lang: str) -> str:
    """Convert text to IPA transcription."""
    epi = _get_epitran(lang)
    if epi is None:
        return ""
    return epi.transliterate(text.lower().strip())


def get_word_ipa(word: str, lang: str) -> str:
    """Convert a single word to IPA."""
    return get_ipa(word, lang)


def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    prev_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr_row = [i + 1]
        for j, c2 in enumerate(s2):
            # Cost is 0 if characters match, 1 otherwise
            cost = 0 if c1 == c2 else 1
            curr_row.append(min(
                curr_row[j] + 1,       # insertion
                prev_row[j + 1] + 1,   # deletion
                prev_row[j] + cost,    # substitution
            ))
        prev_row = curr_row

    return prev_row[-1]


def phonetic_similarity(ipa1: str, ipa2: str) -> float:
    """
    Compute normalized similarity between two IPA strings.
    Returns 0.0 (completely different) to 1.0 (identical).
    """
    if not ipa1 and not ipa2:
        return 1.0
    if not ipa1 or not ipa2:
        return 0.0

    distance = levenshtein_distance(ipa1, ipa2)
    max_len = max(len(ipa1), len(ipa2))
    return 1.0 - (distance / max_len)


def is_language_supported(lang: str) -> bool:
    """Check if a language is supported by our Epitran setup."""
    return lang in LANG_MAP
