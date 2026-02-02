# Testing Guide - Multilingual Support

This guide explains how to test the multilingual ingredient matching feature.

## Quick Start

### 1. Start the Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8742
```

### 2. Run Unit Tests

```bash
# Test language detection
pytest tests/test_language_detection.py -v

# Test multilingual ingredient matching
pytest tests/test_ingredient_matcher_multilang.py -v

# Test all unit tests
pytest tests/ -v -k "not integration"
```

### 3. Run Integration Tests

**Note:** Integration tests require the backend to be running on `http://localhost:8742`

```bash
# Run all integration tests
pytest tests/test_scraper_integration.py -v -m integration

# Run specific test
pytest tests/test_scraper_integration.py::test_detected_language_not_in_response -v
```

## Manual Testing

### Test 1: French Recipe (Gratin Dauphinois)

```bash
curl -X POST http://localhost:8742/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.marmiton.org/recettes/recette_gratin-dauphinois_13809.aspx"}' \
  | jq '{
    title: .title,
    host: .host,
    has_detected_language: has("detected_language"),
    enriched_ingredients: .enriched_ingredients[0:5]
  }'
```

**Expected Output:**
```json
{
  "title": "Gratin Dauphinois",
  "host": "marmiton.org",
  "has_detected_language": false,
  "enriched_ingredients": [
    {"text": "1.5 kg de pomme de terre", "image_id": "potato"},
    {"text": "2 gousses d'ail", "image_id": "garlic"},
    {"text": "30 cl de crème", "image_id": "cream"},
    {"text": "100 g de beurre", "image_id": "butter"},
    {"text": "1 l de lait", "image_id": "milk"}
  ]
}
```

**Validation:**
- ✅ `has_detected_language` is `false` (not exposed in API)
- ✅ French ingredients are matched correctly
- ✅ `pomme de terre` → `potato`, `ail` → `garlic`, `crème` → `cream`

### Test 2: French Recipe (Cookies)

```bash
curl -X POST http://localhost:8742/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.marmiton.org/recettes/recette_original-american-cookies-de-mike_39907.aspx"}' \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'Title: {data[\"title\"]}')
print(f'Has detected_language: {\"detected_language\" in data}')
print('\\nMatched ingredients:')
for ing in data['enriched_ingredients']:
    if ing['image_id']:
        print(f'  {ing[\"text\"]} -> {ing[\"image_id\"]}')
"
```

**Expected Output:**
```
Title: Original American cookies de Mike
Has detected_language: False

Matched ingredients:
  150 g de beurre -> butter
  2 oeufs -> egg
  250 g de farine -> flour
  200 g de pépites de chocolat -> chocolate
  ...
```

### Test 3: English Recipe (if available)

**Note:** You'll need to find an English recipe URL from a supported site (e.g., allrecipes.com)

```bash
curl -X POST http://localhost:8742/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.allrecipes.com/recipe/..."}' \
  | jq '.enriched_ingredients[] | select(.image_id != null)'
```

**Expected:**
- English ingredients like "flour", "eggs", "butter" should be matched
- Compound ingredients like "olive oil" should be matched

### Test 4: Unsupported Language (German)

```bash
curl -X POST http://localhost:8742/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.chefkoch.de/rezepte/..."}' \
  | jq '.enriched_ingredients[0:3]'
```

**Expected:**
- All `image_id` fields should be `null` (no German dictionary)
- This is acceptable behavior for unsupported languages

## Test Results Summary

### Unit Tests (68 passed)

```
tests/test_language_detection.py ..................... 11 passed
tests/test_ingredient_matcher_multilang.py .......... 22 passed
tests/test_ingredient_matcher.py ................... 35 passed
```

### Integration Tests (requires backend running)

```
tests/test_scraper_integration.py
  ├─ test_scrape_marmiton_gateau_chocolat ......... PASSED
  ├─ test_scrape_marmiton_gratin_dauphinois ....... PASSED
  ├─ test_scrape_marmiton_dal_lentilles ........... PASSED
  ├─ test_scrape_marmiton_cookies ................. PASSED
  ├─ test_scrape_cuisineaz ........................ PASSED
  ├─ test_detected_language_not_in_response ....... PASSED
  └─ test_ingredient_matching_quality ............. PASSED
```

## Common Issues & Solutions

### Issue 1: Backend not starting

**Symptoms:**
```
curl: (7) Failed to connect to localhost port 8742
```

**Solution:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8742
```

### Issue 2: Tests fail with "fixture 'client' not found"

**Symptoms:**
```
ERROR at setup of test_health_check
fixture 'client' not found
```

**Explanation:** These are old tests from a previous API implementation (with database). They can be ignored.

**Solution:** Run tests with filter:
```bash
pytest tests/ -v -k "not test_api"
```

### Issue 3: Integration tests timeout

**Symptoms:**
```
httpx.ConnectError: All connection attempts failed
```

**Solution:**
- Make sure backend is running: `curl http://localhost:8742/api/health`
- Check firewall settings
- Try increasing timeout in `conftest.py`

## Verification Checklist

Use this checklist to validate the implementation:

- [ ] **Unit Tests**
  - [ ] All language detection tests pass (11/11)
  - [ ] All multilingual matcher tests pass (22/22)
  - [ ] All ingredient matcher tests pass (35/35)

- [ ] **Integration Tests**
  - [ ] Backend starts successfully
  - [ ] `/api/health` returns `{"status": "ok"}`
  - [ ] French recipes are scraped correctly
  - [ ] Ingredients are enriched with image_ids
  - [ ] `detected_language` is NOT in response

- [ ] **Manual Tests**
  - [ ] French recipe (Marmiton) works
  - [ ] French recipe (CuisineAZ) works
  - [ ] Match rate > 30% for typical recipes
  - [ ] Compound ingredients work ("huile d'olive" → "olive-oil")
  - [ ] Plural handling works ("oeufs" → "egg")

- [ ] **API Response**
  - [ ] Response does NOT include `detected_language` field
  - [ ] `enriched_ingredients` array is populated
  - [ ] `image_id` is `null` for unmatched ingredients
  - [ ] `image_id` is a string for matched ingredients

## Performance Metrics

Expected performance for typical recipes:

| Metric | Target | Typical |
|--------|--------|---------|
| Scraping time | < 5s | 2-3s |
| Match rate (FR) | > 30% | 60-80% |
| Match rate (EN) | > 30% | 50-70% |
| API response time | < 100ms | 30-50ms |

## Next Steps

After validating the implementation:

1. **Deploy to production** - Update Docker container on NAS
2. **Monitor match rates** - Track which ingredients are not matched
3. **Expand dictionaries** - Add more ingredients based on usage
4. **Add more languages** - DE, ES, IT dictionaries
5. **Consider ML model** - For better matching in the future

## Support

If you encounter issues:

1. Check this guide first
2. Review the logs: `uvicorn` output or Docker logs
3. Run tests in verbose mode: `pytest -vv`
4. Check the implementation doc: `MULTILANG_IMPLEMENTATION.md`
