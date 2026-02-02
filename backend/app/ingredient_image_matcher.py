"""
Ingredient image matching service for multilingual ingredient recognition.

SIMPLIFIED APPROACH:
- Detects language from domain (internal, not exposed in API)
- Uses language-specific dictionaries to match ingredients to image IDs
- Same matching logic for all languages (LAST match strategy)

Supported languages:
- French (FR) → Uses FR_TO_EN dictionary
- English (EN) → Uses EN_INGREDIENTS dictionary
- Other languages → Returns None (no dictionary available)
"""

from typing import Optional
from .data.translations.fr_to_en import FR_TO_EN
from .data.translations.en_ingredients import EN_INGREDIENTS


def normalize_text(text: str) -> str:
    """
    Normalize text: lowercase + remove special characters.

    Args:
        text: Raw ingredient text (e.g., "200g de farine", "3 Œuf(s)")

    Returns:
        Normalized text (lowercase, special chars removed)
    """
    import re

    text = text.lower()

    # Replace apostrophes with spaces to split "d'ail" → "d ail"
    text = re.sub(r"[''']", ' ', text)

    # Remove special characters (parentheses, commas, semicolons, etc.)
    # This fixes the "Œuf(s)" bug
    text = re.sub(r'[(),;:]', ' ', text)

    return text


def extract_keywords(ingredient: str) -> list[str]:
    """
    Extract keywords from an ingredient string.

    No stopword filtering - if the dictionary is clean, stopwords won't match anyway.

    Args:
        ingredient: Raw ingredient text

    Returns:
        List of keywords (words with 2+ characters, excluding pure numbers)
    """
    normalized = normalize_text(ingredient)
    words = normalized.split()

    # Keep words with 2+ characters, filter out pure numbers only
    return [w for w in words if len(w) >= 2 and not w.replace('.', '').isdigit()]


def get_ingredient_image_id(ingredient: str, language: str = "fr") -> Optional[str]:
    """
    Get the image ID for an ingredient based on detected language.

    ULTRA-SIMPLE LOGIC (same for all languages):
    1. Check for multi-word compounds (language-specific patterns)
    2. Extract ALL keywords from the ingredient
    3. Check each keyword against the language dictionary
    4. Return the LAST match found

    Supported languages:
    - "fr": French → Uses FR_TO_EN dictionary
    - "en": English → Uses EN_INGREDIENTS dictionary
    - Other: Returns None (no dictionary available)

    Examples:
        # French
        >>> get_ingredient_image_id("200g de farine", "fr")
        "flour"
        >>> get_ingredient_image_id("huile d'olive", "fr")
        "olive-oil"

        # English
        >>> get_ingredient_image_id("2 cups flour", "en")
        "flour"
        >>> get_ingredient_image_id("3 eggs", "en")
        "egg"

        # Unsupported language
        >>> get_ingredient_image_id("200g Mehl", "de")
        None

    Args:
        ingredient: Raw ingredient text (e.g., "200g de farine")
        language: Language code (fr, en, de, etc.) - defaults to "fr"

    Returns:
        Image ID (English) or None if no match
    """
    import re

    # STEP 1: Choose dictionary based on language
    if language == "fr":
        dictionary = FR_TO_EN
    elif language == "en":
        dictionary = EN_INGREDIENTS
    else:
        # No dictionary for this language
        return None

    # STEP 2: Check for multi-word compounds (only for French for now)
    if language == "fr":
        normalized_ingredient = ingredient.lower()

        # French compound patterns
        compound_patterns = [
            (r'huile.{0,10}olive', 'olive-oil'),
            (r'pomme.{0,10}terre', 'potato'),
            (r'citron.{0,10}vert', 'lime'),
            (r'noix.{0,10}coco', 'coconut'),
            (r'pâte.{0,10}tartiner', 'spread'),
            (r'pate.{0,10}tartiner', 'spread'),
            (r'haricot.{0,10}rouge', 'kidney-bean'),
        ]

        for pattern, image_id in compound_patterns:
            if re.search(pattern, normalized_ingredient):
                return image_id

    # STEP 3: Extract ALL keywords
    keywords = extract_keywords(ingredient)

    # STEP 4: Find matches and return LAST (simple strategy for all)
    last_match = None
    for keyword in keywords:
        result = _lookup_single_keyword(keyword, dictionary)
        if result:
            last_match = result

    return last_match


def _lookup_single_keyword(keyword: str, dictionary: dict) -> Optional[str]:
    """
    Look up a single keyword in the dictionary.

    Tries exact match, then singular forms (removes trailing 's' or 'x').

    Args:
        keyword: Single normalized keyword
        dictionary: The dictionary to look up (FR_TO_EN or EN_INGREDIENTS)

    Returns:
        Image ID or None
    """
    if keyword in dictionary:
        return dictionary[keyword]

    # Try without trailing 's' (basic plural handling)
    if keyword.endswith('s') and len(keyword) > 3:
        singular = keyword[:-1]
        if singular in dictionary:
            return dictionary[singular]

    # Try without 'x' (some French plurals: "choux" → "chou")
    if keyword.endswith('x') and len(keyword) > 3:
        singular = keyword[:-1]
        if singular in dictionary:
            return dictionary[singular]

    return None


# Legacy function name for backward compatibility
def match_ingredient_fr_to_en(ingredient: str) -> Optional[str]:
    """
    Legacy function - redirects to get_ingredient_image_id with language="fr".
    Kept for backward compatibility with existing tests.
    """
    return get_ingredient_image_id(ingredient, language="fr")
