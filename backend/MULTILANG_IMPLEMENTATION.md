# Multilingual Ingredient Matching - Implementation Summary

## Overview

This document describes the **simplified multilingual support** for ingredient image matching in Reciper.

### Key Principles

1. **Language detection is internal** - Not exposed in the API response
2. **Dictionary-based matching** - Each language has its own dictionary
3. **Unified matching logic** - Same algorithm (LAST match) for all languages
4. **Graceful fallback** - Unsupported languages return `None` for image_id

## Architecture

```
URL → Detect Language (internal) → Choose Dictionary → Match Ingredients → image_id
```

### Example Flow

**French Recipe (Marmiton):**
```
"200g de farine"
  → Language: "fr" (detected from domain)
  → Dictionary: FR_TO_EN
  → Match: "farine" → "flour"
  → Result: image_id = "flour"
```

**English Recipe (AllRecipes):**
```
"2 cups flour"
  → Language: "en" (detected from domain)
  → Dictionary: EN_INGREDIENTS
  → Match: "flour" → "flour"
  → Result: image_id = "flour"
```

**German Recipe (Chefkoch):**
```
"200g Mehl"
  → Language: "de" (detected from domain)
  → Dictionary: None (not supported)
  → Result: image_id = None
```

## Supported Languages

| Language | Code | Dictionary | Status |
|----------|------|------------|--------|
| French | `fr` | `FR_TO_EN` (~275 entries) | ✅ Supported |
| English | `en` | `EN_INGREDIENTS` (~180 entries) | ✅ Supported |
| German | `de` | None | ❌ Not supported (returns None) |
| Spanish | `es` | None | ❌ Not supported (returns None) |
| Italian | `it` | None | ❌ Not supported (returns None) |

## Implementation Details

### 1. Language Detection (`language_detection.py`)

**Method 1: Domain-based detection**
```python
LANGUAGE_DOMAINS = {
    "marmiton.org": "fr",
    "750g.com": "fr",
    "cuisineaz.com": "fr",
    "allrecipes.com": "en",
    "foodnetwork.com": "en",
    "chefkoch.de": "de",
    # ...
}
```

**Method 2: TLD fallback**
```python
TLD_LANGUAGE_MAP = {
    ".fr": "fr",
    ".de": "de",
    ".es": "es",
    ".it": "it",
    ".com": "en",  # Default for .com
    ".org": "en",
}
```

### 2. Ingredient Matching (`ingredient_image_matcher.py`)

**Simplified Logic (same for all languages):**

```python
def get_ingredient_image_id(ingredient: str, language: str = "fr") -> Optional[str]:
    """
    Match ingredient using language-specific dictionary.

    Steps:
    1. Choose dictionary based on language
    2. Check compound patterns (if any)
    3. Extract keywords
    4. Find matches (LAST match wins)
    """

    # Step 1: Choose dictionary
    if language == "fr":
        dictionary = FR_TO_EN
    elif language == "en":
        dictionary = EN_INGREDIENTS
    else:
        return None  # No dictionary for this language

    # Step 2-4: Apply matching logic
    # (same for all languages)
```

### 3. Dictionaries

**French Dictionary (`fr_to_en.py`):**
- Maps French ingredients to English image IDs
- Example: `"farine": "flour"`, `"tomate": "tomato"`
- ~275 entries

**English Dictionary (`en_ingredients.py`):**
- Maps English ingredients directly to image IDs
- Includes plural/singular variations
- Includes British English variations (aubergine → eggplant, prawns → shrimp)
- ~180 entries

### 4. API Response Schema

**IMPORTANT:** The `detected_language` field is **NOT** included in the API response.

```json
{
  "url": "https://www.marmiton.org/...",
  "title": "Gratin Dauphinois",
  "host": "marmiton.org",
  "ingredients": ["1.5 kg de pomme de terre", "2 gousses d'ail", ...],
  "enriched_ingredients": [
    {"text": "1.5 kg de pomme de terre", "image_id": "potato"},
    {"text": "2 gousses d'ail", "image_id": "garlic"},
    ...
  ]
}
```

Language detection happens internally and is **never exposed** to the client.

## Matching Strategy

### LAST Match (used for all languages)

**Rationale:**
- **French:** Main ingredient typically comes last ("2 pots de yaourt de farine" → "farine")
- **English:** Also works reasonably well ("cup of yogurt of flour" → "flour")
- **Simple & predictable:** No complex heuristics needed

### Compound Patterns (French only for now)

Some multi-word ingredients are detected as compounds:
```python
compound_patterns = [
    (r'huile.{0,10}olive', 'olive-oil'),
    (r'pomme.{0,10}terre', 'potato'),
    (r'citron.{0,10}vert', 'lime'),
    (r'noix.{0,10}coco', 'coconut'),
    (r'haricot.{0,10}rouge', 'kidney-bean'),
]
```

### Plural Handling

Both dictionaries handle plural/singular:
- French: `"oeufs"` → try `"oeuf"` (remove trailing 's' or 'x')
- English: `"eggs"` → try `"egg"` (remove trailing 's')

## Tests

### Unit Tests

**`test_ingredient_matcher_multilang.py`** (22 tests)
- French ingredients (simple, compound, with quantities)
- English ingredients (simple, plural/singular, British variations)
- Unsupported languages (return None)
- Edge cases (empty, numbers, stopwords, case sensitivity)

**`test_language_detection.py`** (11 tests)
- Domain-based detection
- TLD fallback
- Case insensitivity
- Unknown domains default to English

### Integration Tests

**`test_scraper_integration.py`** (7 tests)
- Real French recipes (Marmiton, CuisineAZ)
- Verify `detected_language` is NOT in response
- Verify ingredient enrichment quality (>30% match rate)

## Adding a New Language

To add support for a new language (e.g., German):

1. **Create dictionary** (`app/data/translations/de_to_en.py`):
```python
DE_TO_EN = {
    "mehl": "flour",
    "ei": "egg",
    "eier": "egg",
    # ...
}
```

2. **Update matcher** (`ingredient_image_matcher.py`):
```python
def get_ingredient_image_id(ingredient: str, language: str = "fr"):
    if language == "fr":
        dictionary = FR_TO_EN
    elif language == "en":
        dictionary = EN_INGREDIENTS
    elif language == "de":
        dictionary = DE_TO_EN  # NEW
    else:
        return None
```

3. **Add tests** (`test_ingredient_matcher_multilang.py`):
```python
class TestGermanIngredients:
    def test_simple_german_ingredient(self):
        assert get_ingredient_image_id("200g Mehl", "de") == "flour"
```

That's it! No need to change the API schema or add language-specific matching logic.

## Benefits of This Approach

✅ **Simple** - One matching algorithm for all languages
✅ **Internal** - Language detection not exposed in API
✅ **Extensible** - Easy to add new languages (just create dictionary)
✅ **Tested** - Comprehensive unit and integration tests
✅ **No over-engineering** - No complexity for unsupported languages

## Limitations & Future Work

### Current Limitations

- Only FR and EN are supported
- Other languages return `None` for `image_id` (acceptable for now)
- Same matching strategy (LAST match) for all languages
- English dictionary (~180 entries) smaller than French (~275)

### Future Improvements

1. **Expand English dictionary** - Add more ingredients
2. **Add compound patterns for English** - "olive oil", "bell pepper", etc.
3. **Support more languages** - DE, ES, IT dictionaries
4. **Weighted scoring** - Instead of LAST match, score by position + frequency
5. **Machine learning** - Eventually replace dictionaries with ML model

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `app/schemas.py` | Modified | Removed `detected_language` field |
| `app/scraper.py` | Modified | Removed `detected_language` from response |
| `app/ingredient_image_matcher.py` | Simplified | Unified matching logic, removed `_select_best_match()` |
| `app/data/translations/en_ingredients.py` | Created | English ingredient dictionary |
| `tests/test_ingredient_matcher_multilang.py` | Created | Unit tests for multilingual matching |
| `tests/test_scraper_integration.py` | Modified | Removed assertions on `detected_language` |

## Validation

### Manual Tests

```bash
# Test 1: French recipe
curl -X POST http://localhost:8742/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.marmiton.org/recettes/recette_gratin-dauphinois_13809.aspx"}' \
  | jq '.enriched_ingredients[] | select(.image_id != null)'

# Expected: pomme de terre → potato, ail → garlic, crème → cream
```

### Automated Tests

```bash
# Unit tests (language detection)
pytest tests/test_language_detection.py -v

# Unit tests (ingredient matching)
pytest tests/test_ingredient_matcher_multilang.py -v

# Integration tests
pytest tests/test_scraper_integration.py -v -m integration
```

## Summary

This implementation provides a **simple, extensible foundation** for multilingual ingredient matching:
- Language detection happens internally (not exposed in API)
- Each language uses its own dictionary
- Same matching logic for all languages (no over-engineering)
- Easy to extend (just add new dictionaries)
- Comprehensive test coverage (33 unit tests + 7 integration tests)

The approach prioritizes simplicity over sophistication, which is appropriate for the current stage of the project. More advanced techniques (ML, weighted scoring) can be added later if needed.
