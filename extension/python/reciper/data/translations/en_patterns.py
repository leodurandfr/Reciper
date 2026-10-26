"""
English-specific patterns for ingredient image matching.

This module handles linguistic ambiguities specific to the English language.
Regroupements (e.g., tagliatelle → pasta) are handled in en_ingredients.py dictionary.

English has fewer ambiguities than French, but some patterns are still useful.
"""

# Compound patterns: (regex_pattern, image_id)
# These are checked FIRST, in order of priority
COMPOUND_PATTERNS = [
    # "cherry tomatoes" = tomato (NOT cherry)
    (r'cherry\s+tomato', 'tomato'),

    # "olive oil" = oil
    (r'olive\s+oil', 'oil'),

    # "ground beef" / "minced beef" = beef
    (r'(ground|minced)\s+(beef|meat)', 'beef'),

    # "coconut milk/oil" = coconut
    (r'coconut\s+(milk|oil|cream)', 'coconut'),

    # "red onion" = red-onion (NOT onion)
    (r'red\s+onion', 'red-onion'),

    # "brown sugar" = brown-sugar (NOT sugar)
    (r'brown\s+sugar', 'brown-sugar'),

    # "bolognese sauce" / "tomato sauce" = tomato-sauce
    (r'bolognese\s+sauce', 'tomato-sauce'),
    (r'tomato\s+sauce', 'tomato-sauce'),

    # "chocolate chips" = chocolate
    (r'chocolate\s+chip', 'chocolate'),

    # "foie gras" = pate
    (r'foie\s+gras', 'pate'),

    # "soy sauce" / "fish sauce" = sauce
    (r'soy\s+sauce', 'sauce'),
    (r'fish\s+sauce', 'sauce'),

    # "pesto rosso" = pesto-rosso (NOT pesto)
    (r'pesto\s+rosso', 'pesto-rosso'),
]

# Exclusion patterns: (regex_pattern, keyword_to_exclude)
# If the pattern matches, the specified keyword should NOT be matched
EXCLUSION_PATTERNS = [
    # "teaspoon" / "tablespoon" - don't match "tea" or "spoon"
    (r'teaspoon', 'tea'),
    (r'tablespoon', 'table'),

    # "cake pan" / "baking pan" - 'pan' is not an ingredient
    (r'(cake|baking|muffin)\s+pan', 'pan'),
]
