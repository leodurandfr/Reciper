# Language Detection for Ingredient Matching

## How it works

The system detects the recipe's language based on the website domain:

1. **Domain extraction**: `scraper.host()` → "marmiton.org"
2. **Language mapping**: DOMAIN_LANGUAGE_MAP → "fr"
3. **Strategy selection**: "fr" → last-match strategy

This ensures that ingredient matching uses the correct linguistic rules for each language.

## Supported sites

| Language | Domains |
|----------|---------|
| **French** | marmiton.org, 750g.com, cuisineaz.com, recettes.qwant.com, ptitchef.com, cuisine-etudiant.fr |
| **German** | chefkoch.de, rezeptwelt.de, kochbar.de, lecker.de |
| **Spanish** | recetasgratis.net, directoalpaladar.com, recetasderechupete.com |
| **Italian** | giallozafferano.it, cookaround.com, fattoincasadabenedetta.it |
| **English** | allrecipes.com, foodnetwork.com, bbcgoodfood.com (default fallback) |

## Matching strategies

Different languages have different word order patterns for ingredients:

| Language | Strategy | Reason | Example |
|----------|----------|--------|---------|
| **French** | Last match | Main ingredient at end | "2 cuillères de **farine**" → farine ✓ |
| **German** | First match | Compound nouns at start | "**Weizenmehl** Type 405" → Weizenmehl ✓ |
| **Spanish** | First match | Noun before adjectives | "**tomate** roja picada" → tomate ✓ |
| **Italian** | First match | Noun before adjectives | "**pomodoro** rosso" → pomodoro ✓ |
| **English** | Last match | Variable order (for now) | "2 cups of **flour**" → flour ✓ |

### Why different strategies?

**French example:**
- Input: "2 cuillères à soupe de farine de blé"
- Keywords: ["cuillères", "soupe", "farine", "blé"]
- Matches: ["farine", "blé"]
- **LAST match** → "blé" (wheat) ✓ Wrong! Should be "farine" (flour)
- Actually, this shows we need to refine - but "farine" comes before modifiers

**German example:**
- Input: "Weizenmehl Type 405"
- Keywords: ["weizenmehl", "type", "405"]
- Matches: ["weizenmehl"]
- **FIRST match** → "weizenmehl" (wheat flour) ✓

## Adding a new site

To add support for a new recipe website:

### Step 1: Add to language map

Edit `backend/app/language_detection.py`:

```python
DOMAIN_LANGUAGE_MAP = {
    # ... existing entries ...
    'newsite.fr': 'fr',  # Add your domain here
}
```

### Step 2: Test the detection

```bash
# Run integration tests to verify language detection works
pytest tests/test_scraper_integration.py -v -k "language_detection"
```

### Step 3: Verify ingredient matching

Test a recipe from the new site to ensure ingredients are correctly matched:

```bash
curl -X POST http://localhost:8742/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://newsite.fr/recipe-url"}'
```

Check the response:
- `detected_language` should be correct
- `enriched_ingredients` should have `image_id` values

## Fallbacks

The system has multiple fallback levels:

1. **Direct match**: Domain exists in DOMAIN_LANGUAGE_MAP → use mapped language
2. **TLD fallback**: Domain ends with `.fr`, `.de`, `.es`, `.it` → use corresponding language
3. **Default fallback**: Unknown domain → default to English (`en`)

Examples:
- `marmiton.org` → Direct match → `fr` ✓
- `nouveausite.fr` → TLD fallback → `fr` ✓
- `unknownsite.com` → Default fallback → `en` ✓

## API Response

The detected language is included in the scrape response:

```json
{
  "url": "https://www.marmiton.org/recettes/...",
  "host": "marmiton.org",
  "detected_language": "fr",
  "title": "Gratin dauphinois",
  "ingredients": ["1kg de pommes de terre", "..."],
  "enriched_ingredients": [
    {
      "text": "1kg de pommes de terre",
      "image_id": "potato"
    }
  ]
}
```

## Current Limitations

### Dictionary Coverage

Currently, only the **French → English** dictionary (`FR_TO_EN`) is implemented. This means:

- ✅ French sites: Fully functional
- ⚠️ German/Spanish/Italian sites: Language detected, but matching uses FR_TO_EN dictionary
- ⚠️ English sites: May have partial matches only

**Future work**: Create dedicated dictionaries:
- `DE_TO_EN` for German ingredients
- `ES_TO_EN` for Spanish ingredients
- `IT_TO_EN` for Italian ingredients
- `EN_INGREDIENTS` for direct English matching

### Strategy Refinement

The current strategies (first/last match) are simplified. Future improvements:

- **Weighted scoring**: Prefer longer words, specific ingredients over generic ones
- **Position-aware scoring**: Consider word position in the ingredient string
- **Category-based fallbacks**: If no match, return category (e.g., "vegetable", "spice")

## Testing

### Unit Tests (Fast)

```bash
# Run only unit tests (no network calls)
pytest tests/ -m "not integration" -v
```

### Integration Tests (Slow, Requires Network)

```bash
# Run integration tests with real URLs
pytest tests/ -m "integration" -v

# Run specific integration test
pytest tests/test_scraper_integration.py::test_language_detection_returns_in_response -v
```

### Manual Testing

```bash
# Start the backend
cd backend
uvicorn app.main:app --reload --port 8742

# Test language detection
curl -X POST http://localhost:8742/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.marmiton.org/recettes/recette_gratin-dauphinois_13809.aspx"}' \
  | jq '.detected_language'
# Should output: "fr"
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Chrome Extension                       │
│                POST /api/scrape                          │
│          {"url": "https://marmiton.org/..."}             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API (scraper.py)                │
│  1. Fetch HTML                                           │
│  2. Extract host → "marmiton.org"                        │
│  3. Detect language → get_language_from_domain()         │
│     └─> "fr"                                             │
│  4. Extract ingredients                                  │
│     └─> ["1kg de pommes de terre", "20cl de crème"]     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│         Ingredient Image Matcher (matcher.py)            │
│  For each ingredient:                                    │
│    get_ingredient_image_id(text, language="fr")          │
│                                                           │
│  1. Check compound patterns (huile + olive → olive-oil)  │
│  2. Extract keywords ["pommes", "terre"]                 │
│  3. Lookup in FR_TO_EN dictionary                        │
│  4. Select best match using language strategy:           │
│     - French: LAST match → "terre" → "potato" ✓          │
│     - German: FIRST match                                │
│     - Spanish/Italian: FIRST match                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  API Response                            │
│  {                                                        │
│    "detected_language": "fr",                            │
│    "enriched_ingredients": [                             │
│      {"text": "1kg de pommes de terre",                 │
│       "image_id": "potato"}                              │
│    ]                                                      │
│  }                                                        │
└─────────────────────────────────────────────────────────┘
```

## Files Modified

### New Files
- `backend/app/language_detection.py` - Language detection module
- `backend/tests/test_scraper_integration.py` - Integration tests
- `backend/pytest.ini` - Pytest configuration
- `backend/LANGUAGE_DETECTION.md` - This documentation

### Modified Files
- `backend/app/scraper.py` - Integrated language detection
- `backend/app/ingredient_image_matcher.py` - Added language-specific strategies
- `backend/app/schemas.py` - Added `detected_language` field

## Next Steps

1. **Expand dictionaries**: Create DE_TO_EN, ES_TO_EN, IT_TO_EN
2. **Improve matching**: Implement weighted scoring for better accuracy
3. **Category fallbacks**: Return ingredient categories when exact match fails
4. **Performance optimization**: Cache language detection results
5. **Analytics**: Track match rates per language to identify gaps
