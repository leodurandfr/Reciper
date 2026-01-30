"""
Ingredient image matching service for multilingual ingredient recognition.

Matches raw ingredient strings (e.g., "200g farine", "2 tomatoes") to
standardized ingredient IDs for image display using keyword-based matching
across multiple languages.
"""

from typing import Optional
from .data.ingredient_mapping import INGREDIENT_DATABASE, CATEGORY_IMAGES


def normalize_text(text: str) -> str:
    """
    Normalize text: lowercase, remove common stopwords and numbers.

    Args:
        text: Raw ingredient text (e.g., "200g de farine")

    Returns:
        Normalized text with stopwords removed
    """
    text = text.lower()

    # Common stopwords across languages (articles, prepositions, units)
    stopwords = [
        # French
        'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', "d'",
        # English
        'the', 'a', 'an', 'of',
        # Units
        'g', 'kg', 'ml', 'l', 'cl', 'dl',
        'cup', 'cups', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
        'tbsp', 'tsp', 'oz', 'lb', 'lbs',
        # Other
        'à', 'pour', 'en', 'dans'
    ]

    words = text.split()
    # Filter out stopwords and pure numbers
    filtered = [w for w in words if w not in stopwords and not w.replace('.', '').replace(',', '').isdigit()]

    return ' '.join(filtered)


def extract_keywords(ingredient: str) -> list[str]:
    """
    Extract significant keywords from an ingredient string.

    Args:
        ingredient: Raw ingredient text

    Returns:
        List of keywords (words with 3+ characters)
    """
    normalized = normalize_text(ingredient)

    # Keep only words with 3+ characters to avoid noise
    keywords = [w for w in normalized.split() if len(w) >= 3]

    return keywords


def match_ingredient(ingredient: str) -> Optional[str]:
    """
    Find the ingredient ID matching a raw ingredient string.

    Searches across all languages and handles plural variations.

    Args:
        ingredient: Raw ingredient text (e.g., "200g de farine", "2 tomatoes")

    Returns:
        Ingredient ID (e.g., "flour", "tomato") or None if no match
    """
    keywords = extract_keywords(ingredient)

    # Search across all languages
    for keyword in keywords:
        for ingredient_id, data in INGREDIENT_DATABASE.items():
            for lang_keywords in data['keywords'].values():
                # Direct match
                if keyword in lang_keywords:
                    return ingredient_id

                # Handle plural: remove trailing 's' or 'es'
                singular = keyword.rstrip('s')
                if singular != keyword and singular in lang_keywords:
                    return ingredient_id

                # Handle 'es' plural (e.g., "tomatoes" -> "tomato")
                if keyword.endswith('es'):
                    singular_es = keyword[:-2]
                    if singular_es in lang_keywords:
                        return ingredient_id

    return None


def get_ingredient_image_id(ingredient: str) -> Optional[str]:
    """
    Get the image ID for an ingredient (specific or category fallback).

    Args:
        ingredient: Raw ingredient text

    Returns:
        Image ID to use for display, or None if no match
    """
    # Try specific ingredient match
    image_id = match_ingredient(ingredient)
    if image_id:
        return image_id

    # Future: Could implement category detection heuristics here
    # For now, return None to show the default placeholder
    return None
