"""
Simple ingredient matching module.

Matches ingredients to instruction steps using basic text search.
No complex parsing - uses raw ingredient strings.
"""

import re

# Lignes qui sont UNIQUEMENT des numéros d'étapes (à filtrer)
EMPTY_STEP_PATTERN = re.compile(
    r'^(?:[EeÉé]tape|[Ss]tep)?\s*\d+\.?\s*$',
    re.UNICODE
)

# Préfixes à retirer du début des instructions
STEP_PREFIX_PATTERN = re.compile(
    r'^(?:[EeÉé]tape|[Ss]tep)\s*\d+\s*[:.\-–—]?\s*',
    re.UNICODE
)


def _is_empty_step_marker(text: str) -> bool:
    """Vérifie si une ligne est juste un numéro d'étape."""
    return bool(EMPTY_STEP_PATTERN.match(text.strip()))


def _clean_step_text(text: str) -> str:
    """Retire le préfixe 'Étape N:' du texte."""
    return STEP_PREFIX_PATTERN.sub('', text.strip())


def _normalize_text(text: str) -> str:
    """Normalize text for matching (lowercase, remove accents/punctuation)."""
    text = text.lower()
    # Remove common articles
    text = re.sub(r"\b(le|la|les|l'|un|une|des|du|de|d'|the|a|an|some|of)\b", "", text)
    # Remove punctuation
    text = re.sub(r"[^\w\s]", " ", text)
    # Normalize whitespace
    text = " ".join(text.split())
    return text


def _extract_keywords(ingredient: str) -> list[str]:
    """
    Extract significant keywords from an ingredient string.

    Filters out:
    - Short words (<=3 chars)
    - Words starting with digits (quantities)
    - Common units
    """
    common_units = {
        "ml", "cl", "dl", "tsp", "tbsp", "cup", "cups", "tasse", "tasses",
        "gramme", "grammes", "gram", "grams", "kilogramme", "kilogrammes",
        "litre", "litres", "liter", "liters", "ounce", "ounces", "pound", "pounds",
        "cuillère", "cuillères", "soupe", "café", "pincée", "pincées",
        "goutte", "gouttes", "tranche", "tranches", "gousse", "gousses",
        "feuille", "feuilles", "branche", "branches", "morceau", "morceaux",
    }

    normalized = _normalize_text(ingredient)
    words = normalized.split()

    keywords = []
    for word in words:
        # Skip short words
        if len(word) <= 3:
            continue
        # Skip words that look like numbers
        if word[0].isdigit():
            continue
        # Skip common units
        if word in common_units:
            continue
        keywords.append(word)

    return keywords


def match_ingredients_to_step(step: str, ingredients: list[str]) -> list[str]:
    """
    Find which ingredients are mentioned in a given instruction step.

    Uses simple text matching: extracts keywords from each ingredient
    and checks if any keyword appears in the step text.

    Args:
        step: The instruction step text
        ingredients: List of raw ingredient strings

    Returns:
        List of ingredient strings that appear to be referenced in the step
    """
    step_normalized = _normalize_text(step)
    matched = []

    for ingredient in ingredients:
        keywords = _extract_keywords(ingredient)

        # Check if any keyword appears in the step
        for keyword in keywords:
            if keyword in step_normalized:
                matched.append(ingredient)
                break

    return matched


def parse_instructions_with_ingredients(
    instructions: list[str],
    ingredients: list[str]
) -> list[dict]:
    """
    Parse instructions and match them with related ingredients.

    Filters out empty step markers (e.g., "Étape 1", "Step 2") and
    removes step prefixes from instruction text (e.g., "Étape 1: " -> "").

    Args:
        instructions: List of instruction step texts
        ingredients: List of raw ingredient strings

    Returns:
        List of dicts with step_number, text, and related_ingredients
    """
    result = []
    step_number = 1

    for step in instructions:
        if _is_empty_step_marker(step):
            continue

        cleaned_text = _clean_step_text(step)
        if not cleaned_text:
            continue

        related = match_ingredients_to_step(cleaned_text, ingredients)
        result.append({
            "step_number": step_number,
            "text": cleaned_text,
            "related_ingredients": related
        })
        step_number += 1

    return result
