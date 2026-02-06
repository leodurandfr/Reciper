"""
French-specific patterns for ingredient image matching.

This module handles linguistic ambiguities specific to the French language.
Regroupements (e.g., tagliatelle → pasta) are handled in fr_to_en.py dictionary.

These patterns resolve cases where a French word could match the wrong image:
- "pâte feuilletée" (pastry dough) ≠ "pâtes" (pasta)
- "tomates cerise" (cherry tomatoes) should match "tomato", not "cherry"
- "bien mûres" (very ripe) ≠ "mûres" (blackberries)
- "moule à gâteau" (cake pan) ≠ "moules" (mussels)
"""

# Compound patterns: (regex_pattern, image_id)
# These are checked FIRST, in order of priority
# If a pattern matches, the image_id is returned immediately
COMPOUND_PATTERNS = [
    # === DISAMBIGUATION: Resolve French linguistic ambiguities ===

    # "pâte feuilletée/brisée/sablée" = dough (NOT pasta)
    (r'p[âa]te[s]?\s+(feuillet|bris|sabl)', 'dough'),
    (r'rouleau[x]?\s+de\s+p[âa]te', 'dough'),

    # "tomates cerise" = tomato (NOT cherry)
    (r'tomate[s]?.{0,5}cerise', 'tomato'),

    # "pois chiches" = chickpea (NOT pea)
    (r'pois.{0,3}chiche', 'chickpea'),

    # === MULTI-WORD INGREDIENTS ===

    # Compound ingredients that need pattern matching
    (r'huile.{0,10}olive', 'oil'),
    (r'pomme[s]?.{0,10}terre', 'potato'),
    (r'citron[s]?.{0,10}vert', 'lemon'),
    (r'noix.{0,10}coco', 'coconut'),
    (r'p[âa]te.{0,10}tartiner', 'spread'),
    (r'haricot[s]?.{0,10}rouge', 'kidney-bean'),
    (r'bouquet[s]?.{0,5}garni', 'herbs'),
    (r'viande[s]?.{0,5}hach[ée]e?', 'beef'),
    (r'b[œoe]+uf.{0,5}hach[ée]', 'beef'),
]

# Exclusion patterns: (regex_pattern, keyword_to_exclude)
# If the pattern matches, the specified keyword should NOT be matched
# This prevents false positives
EXCLUSION_PATTERNS = [
    # "moule" as cooking utensil (not mussel)
    (r'(pour\s+(le\s+)?moule|moule\s+[àa]|beurrer.{0,10}moule)', 'moule'),

    # "mûres" as adjective meaning "ripe" (not blackberry fruit)
    (r'(bien|très|tres|trop)\s+m[ûu]re', 'mûre'),
    (r'(bien|très|tres|trop)\s+m[ûu]res', 'mûres'),

    # "café" in "cuillère à café" is a unit, not coffee
    (r'cuill[èe]re[s]?\s+[àa]\s+caf[ée]', 'café'),
    (r'cuill[èe]re[s]?\s+[àa]\s+caf[ée]', 'cafe'),
]
