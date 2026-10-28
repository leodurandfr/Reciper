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

    # "olive/sunflower/vegetable oil" = oil (NOT olive, sunflower-seed)
    (r'(olive|sunflower|vegetable|canola)\s+oil', 'oil'),

    # "peanut butter" = peanut (NOT butter)
    (r'peanut\s+butter', 'peanut'),

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

    # "chocolate chips" = chocolate-chip
    (r'chocolate\s+chip', 'chocolate-chip'),

    # "foie gras" = pate
    (r'foie\s+gras', 'pate'),

    # "soy sauce" / "fish sauce" = sauce (same illustration)
    (r'soy\s+sauce', 'sauce'),
    (r'fish\s+sauce', 'sauce'),

    # "pesto rosso" = pesto-rosso (NOT pesto)
    (r'pesto\s+rosso', 'pesto-rosso'),
]

# Exclusion patterns: (regex_pattern, keyword(s)_to_exclude)
# If the pattern matches, the specified keyword(s) should NOT be matched.
# Units such as "teaspoon" are single words, so they never yield "tea": none needed.
EXCLUSION_PATTERNS = []

# Unit patterns: removed from the text before matching
UNIT_PATTERNS = []
