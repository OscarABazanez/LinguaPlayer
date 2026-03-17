"""
Pronunciation analysis endpoint.
Compares original text with spoken text using Epitran IPA phonetic analysis.
"""
import re
from fastapi import APIRouter, HTTPException
from ..models.pronunciation_models import (
    PronunciationRequest,
    PronunciationResponse,
    WordComparisonResult,
)
from ..services.epitran_service import (
    get_word_ipa,
    phonetic_similarity,
    is_language_supported,
    levenshtein_distance,
)

router = APIRouter()


def _clean_word(word: str) -> str:
    """Remove punctuation from word edges."""
    return re.sub(r'^[^\w]+|[^\w]+$', '', word.lower().strip())


def _text_similarity(s1: str, s2: str) -> float:
    """Normalized text similarity using Levenshtein distance."""
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    distance = levenshtein_distance(s1.lower(), s2.lower())
    max_len = max(len(s1), len(s2))
    return 1.0 - (distance / max_len)


def _align_words(original_words: list[str], spoken_words: list[str]) -> list[tuple[str, str | None]]:
    """
    Align original words with spoken words.
    Uses simple positional alignment with some tolerance for insertions/deletions.
    Returns list of (original_word, spoken_word_or_None) pairs.
    """
    if not spoken_words:
        return [(w, None) for w in original_words]

    n = len(original_words)
    m = len(spoken_words)

    # Simple DP alignment
    # dp[i][j] = best score aligning original[:i] with spoken[:j]
    INF = float('inf')
    dp = [[INF] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0
    back = [[None] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        for j in range(m + 1):
            if dp[i][j] == INF:
                continue

            # Skip original word (mark as missing)
            if i < n:
                cost = dp[i][j] + 1
                if cost < dp[i + 1][j]:
                    dp[i + 1][j] = cost
                    back[i + 1][j] = ('skip_orig', i, j)

            # Skip spoken word (extra word spoken)
            if j < m:
                cost = dp[i][j] + 1
                if cost < dp[i][j + 1]:
                    dp[i][j + 1] = cost
                    back[i][j + 1] = ('skip_spoken', i, j)

            # Match original[i] with spoken[j]
            if i < n and j < m:
                sim = _text_similarity(
                    _clean_word(original_words[i]),
                    _clean_word(spoken_words[j])
                )
                cost = dp[i][j] + (1.0 - sim)
                if cost < dp[i + 1][j + 1]:
                    dp[i + 1][j + 1] = cost
                    back[i + 1][j + 1] = ('match', i, j)

    # Trace back
    alignment: list[tuple[str, str | None]] = []
    i, j = n, m
    while i > 0 or j > 0:
        if back[i][j] is None:
            break
        action, pi, pj = back[i][j]
        if action == 'match':
            alignment.append((original_words[pi], spoken_words[pj]))
            i, j = pi, pj
        elif action == 'skip_orig':
            alignment.append((original_words[pi], None))
            i, j = pi, pj
        elif action == 'skip_spoken':
            # Extra word spoken, skip it
            i, j = pi, pj

    alignment.reverse()

    # Ensure all original words are in the alignment
    aligned_originals = {a[0] for a in alignment}
    for w in original_words:
        if w not in aligned_originals:
            alignment.append((w, None))

    return alignment


@router.post("/pronunciation/analyze", response_model=PronunciationResponse)
async def analyze_pronunciation(request: PronunciationRequest):
    """
    Analyze pronunciation by comparing original and spoken text phonetically.
    """
    lang = request.language
    use_ipa = is_language_supported(lang)

    # Tokenize
    original_words = request.original_text.strip().split()
    spoken_words = request.spoken_text.strip().split()

    # Align words
    aligned = _align_words(original_words, spoken_words)

    comparisons: list[WordComparisonResult] = []

    for orig, spoken in aligned:
        clean_orig = _clean_word(orig)
        clean_spoken = _clean_word(spoken) if spoken else None

        if not clean_spoken:
            # Word was not spoken (missing)
            orig_ipa = get_word_ipa(clean_orig, lang) if use_ipa and clean_orig else ''
            comparisons.append(WordComparisonResult(
                original=orig,
                spoken=None,
                original_ipa=orig_ipa,
                spoken_ipa=None,
                phonetic_score=0.0,
            ))
            continue

        # Get IPA transcriptions
        if use_ipa and clean_orig and clean_spoken:
            try:
                orig_ipa = get_word_ipa(clean_orig, lang)
                spoken_ipa = get_word_ipa(clean_spoken, lang)
                phon_score = phonetic_similarity(orig_ipa, spoken_ipa)
            except Exception:
                orig_ipa = ''
                spoken_ipa = ''
                phon_score = _text_similarity(clean_orig, clean_spoken)
        else:
            orig_ipa = ''
            spoken_ipa = ''
            phon_score = _text_similarity(clean_orig, clean_spoken)

        comparisons.append(WordComparisonResult(
            original=orig,
            spoken=spoken,
            original_ipa=orig_ipa,
            spoken_ipa=spoken_ipa,
            phonetic_score=phon_score,
        ))

    return PronunciationResponse(word_comparisons=comparisons)
