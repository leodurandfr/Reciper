"""
Ingredient image matching service for multilingual ingredient recognition.

MODULAR APPROACH:
- Each language has its own dictionary (word → image_id mappings)
- Each language has its own patterns file (compound patterns + exclusions)
- Generic matching logic applies to all languages

Supported languages:
- French (FR) → fr_to_en.py (dictionary) + fr_patterns.py (patterns)
- English (EN) → en_ingredients.py (dictionary) + en_patterns.py (patterns)
- Other languages → Returns None (no dictionary available)
"""

from typing import Optional
from .data.translations.fr_to_en import FR_TO_EN
from .data.translations.en_ingredients import EN_INGREDIENTS
from .data.translations import fr_patterns, en_patterns

# Language configuration: dictionary + patterns for each supported language
LANGUAGE_CONFIG = {
    'fr': {
        'dictionary': FR_TO_EN,
        'compound_patterns': fr_patterns.COMPOUND_PATTERNS,
        'exclusion_patterns': fr_patterns.EXCLUSION_PATTERNS,
    },
    'en': {
        'dictionary': EN_INGREDIENTS,
        'compound_patterns': en_patterns.COMPOUND_PATTERNS,
        'exclusion_patterns': en_patterns.EXCLUSION_PATTERNS,
    },
}


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

    MATCHING LOGIC (same for all languages):
    1. Load language-specific config (dictionary + patterns)
    2. Check for compound patterns (e.g., "pâte feuilletée" → dough)
    3. Determine excluded keywords based on exclusion patterns
    4. Extract ALL keywords from the ingredient
    5. Check each keyword against the dictionary (skip excluded ones)
    6. Return the LAST match found

    Supported languages:
    - "fr": French → Uses FR_TO_EN dictionary + fr_patterns
    - "en": English → Uses EN_INGREDIENTS dictionary + en_patterns
    - Other: Returns None (no dictionary available)

    Examples:
        # French
        >>> get_ingredient_image_id("200g de farine", "fr")
        "flour"
        >>> get_ingredient_image_id("huile d'olive", "fr")
        "oil"
        >>> get_ingredient_image_id("1 pâte feuilletée", "fr")
        "dough"

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

    # STEP 1: Load language configuration
    config = LANGUAGE_CONFIG.get(language)
    if not config:
        return None

    dictionary = config['dictionary']
    compound_patterns = config['compound_patterns']
    exclusion_patterns = config['exclusion_patterns']

    normalized_ingredient = ingredient.lower()

    # STEP 2: Check compound patterns first (highest priority)
    for pattern, image_id in compound_patterns:
        if re.search(pattern, normalized_ingredient):
            return image_id

    # STEP 3: Determine which keywords should be excluded
    excluded_keywords = set()
    for pattern, keyword_to_exclude in exclusion_patterns:
        if re.search(pattern, normalized_ingredient):
            excluded_keywords.add(keyword_to_exclude.lower())

    # STEP 4: Extract ALL keywords
    keywords = extract_keywords(ingredient)

    # STEP 5: Find matches, skipping excluded keywords
    last_match = None
    for keyword in keywords:
        if keyword in excluded_keywords:
            continue
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
