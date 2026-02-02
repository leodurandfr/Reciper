# Before/After Comparison: Dictionary Cleanup

## Problem: Ambiguous "rouge" Entry

### Before Cleanup ❌

```python
# In fr_to_en.py
FR_TO_EN = {
    'rouge': 'kidney-bean',    # ❌ Too generic!
    'rouges': 'kidney-bean',
    # ...
}
```

**Test Results:**
```
tomate rouge    → kidney-bean  ❌ WRONG (should be tomato)
oignon rouge    → kidney-bean  ❌ WRONG (should be onion)
vin rouge       → kidney-bean  ❌ WRONG (should be wine)
haricot rouge   → kidney-bean  ✅ CORRECT
```

**Why it failed:**
The "last match" algorithm takes the LAST matching word. In "tomate rouge":
1. "tomate" matches → tomato
2. "rouge" matches → kidney-bean (LAST) ← This wins! ❌

### After Cleanup ✅

```python
# In fr_to_en.py
FR_TO_EN = {
    # 'rouge' and 'rouges' REMOVED
    # Note: Use compound pattern instead
    # ...
}

# In ingredient_image_matcher.py
compound_patterns = [
    (r'haricot.{0,10}rouge', 'kidney-bean'),  # ✅ Explicit compound
    # ...
]
```

**Test Results:**
```
tomate rouge    → tomato       ✅ CORRECT
oignon rouge    → onion        ✅ CORRECT
vin rouge       → wine         ✅ CORRECT
haricot rouge   → kidney-bean  ✅ CORRECT (via compound pattern)
```

**Why it works:**
1. "tomate rouge": Only "tomate" matches → tomato ✅
2. "haricot rouge": Compound pattern matches → kidney-bean ✅

---

## Visual Comparison

### Algorithm Flow (Unchanged)

```
┌─────────────────────────────────────────┐
│  Input: "tomate rouge"                  │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 1: Check compound patterns        │
│  - haricot.{0,10}rouge? NO              │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 2: Extract keywords               │
│  → ["tomate", "rouge"]                  │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 3: Lookup each keyword (LAST)     │
│  - "tomate" → tomato                    │
│  - "rouge" → ???                        │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
  ╔═══════════╗       ╔═══════════╗
  ║  BEFORE   ║       ║   AFTER   ║
  ╚═══════════╝       ╚═══════════╝
        │                   │
        ▼                   ▼
  ┌─────────────┐     ┌─────────────┐
  │ "rouge" →   │     │ "rouge" →   │
  │ kidney-bean │     │ None        │
  └─────────────┘     └─────────────┘
        │                   │
        ▼                   ▼
  ┌─────────────┐     ┌─────────────┐
  │ LAST match  │     │ LAST match  │
  │ kidney-bean │     │ tomato      │
  └─────────────┘     └─────────────┘
        │                   │
        ▼                   ▼
     ❌ WRONG           ✅ CORRECT
```

---

## Real-World Impact

### Recipe: Salade de tomates rouges

**Before:**
```json
{
  "ingredients": [
    {
      "text": "4 tomates rouges",
      "image_id": "kidney-bean"  ❌ WRONG
    }
  ]
}
```

**After:**
```json
{
  "ingredients": [
    {
      "text": "4 tomates rouges",
      "image_id": "tomato"  ✅ CORRECT
    }
  ]
}
```

### Recipe: Haricots rouges à la tomate

**Before:**
```json
{
  "ingredients": [
    {
      "text": "400g de haricots rouges",
      "image_id": "kidney-bean"  ✅ CORRECT
    },
    {
      "text": "2 tomates",
      "image_id": "tomato"  ✅ CORRECT
    }
  ]
}
```

**After:**
```json
{
  "ingredients": [
    {
      "text": "400g de haricots rouges",
      "image_id": "kidney-bean"  ✅ CORRECT (via compound)
    },
    {
      "text": "2 tomates",
      "image_id": "tomato"  ✅ CORRECT
    }
  ]
}
```

---

## Statistics

### Dictionary Size

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total entries | 394 | 392 | -2 |
| Unique images | 229 | 228 | -1 |
| Ambiguous entries | 1 | 0 | -1 |

### Test Coverage

| Test Suite | Before | After |
|-----------|--------|-------|
| `test_ingredient_enrichment.py` | 27/27 ✅ | 27/27 ✅ |
| `test_dictionary_cleanup.py` | 8/12 ❌ | 12/12 ✅ |
| **Total** | **35/39 (89.7%)** | **39/39 (100%)** |

### Audit Results

| Category | Before | After |
|----------|--------|-------|
| Ambiguous modifiers | 1 entry | 0 entries |
| Short words (legitimate) | 4 entries | 4 entries |
| **Total suspicious** | **5** | **4** |
| **Percentage** | **1.3%** | **1.0%** |

---

## Files Changed

### Modified Files (2)

1. **`backend/app/data/translations/fr_to_en.py`**
   - Removed: `'rouge': 'kidney-bean'`
   - Removed: `'rouges': 'kidney-bean'`
   - Added comment explaining removal

2. **`backend/app/ingredient_image_matcher.py`**
   - Added: `(r'haricot.{0,10}rouge', 'kidney-bean')` compound pattern

### New Files (4)

3. **`backend/test_dictionary_cleanup.py`**
   - 12 tests for ambiguous modifier removal
   - Real-world recipe test cases

4. **`backend/audit_dictionary.py`**
   - Script to detect ambiguous entries
   - Categories: modifiers, cuts, preparations

5. **`backend/DICTIONARY_CLEANUP.md`**
   - Complete documentation of cleanup
   - Philosophy for future maintenance
   - Multilingual architecture plan

6. **`IMPLEMENTATION_SUMMARY_CLEANUP.md`**
   - Executive summary of changes
   - Before/after comparison
   - Future roadmap

---

## Lessons Learned

### ✅ What Worked Well

1. **Cleaning dictionary > changing algorithm**
   - Quick to implement
   - No risk of breaking existing logic
   - Immediate benefits

2. **Compound patterns for specific cases**
   - "haricot rouge" works via compound
   - More maintainable than dictionary entries
   - Explicit and non-ambiguous

3. **Test-driven approach**
   - Created tests BEFORE cleanup
   - Verified no regressions
   - Easy to validate success

### 🎯 Key Insights

1. **Problem was not algorithm, but data**
   - "Last match" rule is fine for French
   - Ambiguous dictionary entries caused issues
   - Cleaning data fixed 90% of problems

2. **Generic modifiers should not be in dictionary**
   - Colors: rouge, blanc, vert
   - Sizes: grand, petit
   - Adjectives: douce, salée

3. **Multi-word expressions need compound patterns**
   - More explicit: `haricot.{0,10}rouge`
   - Avoids ambiguity: "rouge" alone doesn't match
   - Maintainable: pattern in code, not hidden in dictionary

### 📋 Best Practices Established

1. **Dictionary Entry Criteria:**
   - ✅ Final ingredient names only
   - ❌ No modifiers, cuts, or preparations

2. **Compound Pattern Usage:**
   - Use for specific multi-word expressions
   - Format: `(r'word1.{0,10}word2', 'image-id')`

3. **Testing Strategy:**
   - Test ambiguous cases explicitly
   - Include real-world recipe examples
   - Run both new and regression tests

---

## Recommendation

### For Current Use (French Sites)

**Status:** ✅ **READY FOR PRODUCTION**

- Dictionary is clean
- Tests all pass
- No regressions

### For Future (Multilingual)

**When needed:** Implement modular architecture
- Detect language (from site domain or text)
- Use language-specific matcher
- Apply appropriate matching strategy

**Until then:** Current solution is optimal
- Avoids over-engineering
- Solves immediate problems
- Easy to maintain
