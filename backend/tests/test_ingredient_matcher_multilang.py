"""
Unit tests for multilingual ingredient matching.

Tests the simplified approach:
- French ingredients use FR_TO_EN dictionary
- English ingredients use EN_INGREDIENTS dictionary
- Unsupported languages return None
- Same matching logic (LAST match) for all languages
"""

import pytest
from app.ingredient_image_matcher import get_ingredient_image_id


class TestFrenchIngredients:
    """Test French ingredient matching."""

    def test_simple_french_ingredient(self):
        """Test simple French ingredients."""
        assert get_ingredient_image_id("200g de farine", "fr") == "flour"
        assert get_ingredient_image_id("3 oeufs", "fr") == "egg"
        assert get_ingredient_image_id("sel", "fr") == "salt"

    def test_french_compound_ingredients(self):
        """Test French compound ingredients (multi-word)."""
        assert get_ingredient_image_id("huile d'olive", "fr") == "olive-oil"
        assert get_ingredient_image_id("pommes de terre", "fr") == "potato"
        assert get_ingredient_image_id("citron vert", "fr") == "lime"
        assert get_ingredient_image_id("noix de coco", "fr") == "coconut"

    def test_french_with_quantities(self):
        """Test French ingredients with quantities and units."""
        assert get_ingredient_image_id("200g de farine", "fr") == "flour"
        assert get_ingredient_image_id("2 cuillères à soupe de beurre", "fr") == "butter"
        assert get_ingredient_image_id("1 kg de tomates", "fr") == "tomato"

    def test_french_last_match_strategy(self):
        """Test that French uses LAST match (main ingredient at end)."""
        # "pot de yaourt de farine" -> should match "farine" (last)
        result = get_ingredient_image_id("pot de yaourt de farine", "fr")
        assert result == "flour", "Should use LAST match for French"

    def test_french_plural_handling(self):
        """Test French plural forms."""
        assert get_ingredient_image_id("des oeufs", "fr") == "egg"
        assert get_ingredient_image_id("les tomates", "fr") == "tomato"
        assert get_ingredient_image_id("3 carottes", "fr") == "carrot"


class TestEnglishIngredients:
    """Test English ingredient matching."""

    def test_simple_english_ingredient(self):
        """Test simple English ingredients."""
        assert get_ingredient_image_id("flour", "en") == "flour"
        assert get_ingredient_image_id("eggs", "en") == "egg"
        assert get_ingredient_image_id("salt", "en") == "salt"

    def test_english_with_quantities(self):
        """Test English ingredients with quantities."""
        assert get_ingredient_image_id("2 cups flour", "en") == "flour"
        assert get_ingredient_image_id("3 eggs", "en") == "egg"
        assert get_ingredient_image_id("1 tbsp butter", "en") == "butter"
        assert get_ingredient_image_id("1 cup milk", "en") == "milk"

    def test_english_plural_singular(self):
        """Test English plural/singular variations."""
        assert get_ingredient_image_id("1 potato", "en") == "potato"
        assert get_ingredient_image_id("4 potatoes", "en") == "potato"
        assert get_ingredient_image_id("1 tomato", "en") == "tomato"
        assert get_ingredient_image_id("2 tomatoes", "en") == "tomato"

    def test_english_last_match_strategy(self):
        """Test that English also uses LAST match strategy."""
        # "cup of yogurt of flour" -> should match "flour" (last)
        result = get_ingredient_image_id("cup of yogurt of flour", "en")
        assert result == "flour", "Should use LAST match for English"

    def test_english_british_variations(self):
        """Test British English variations."""
        assert get_ingredient_image_id("aubergine", "en") == "eggplant"
        assert get_ingredient_image_id("prawns", "en") == "shrimp"
        assert get_ingredient_image_id("coriander", "en") == "cilantro"


class TestUnsupportedLanguages:
    """Test that unsupported languages return None."""

    def test_german_returns_none(self):
        """Test German ingredients return None (no dictionary)."""
        assert get_ingredient_image_id("200g Mehl", "de") is None
        assert get_ingredient_image_id("3 Eier", "de") is None
        assert get_ingredient_image_id("Olivenöl", "de") is None

    def test_spanish_returns_none(self):
        """Test Spanish ingredients return None (no dictionary)."""
        assert get_ingredient_image_id("200g de harina", "es") is None
        assert get_ingredient_image_id("3 huevos", "es") is None

    def test_italian_returns_none(self):
        """Test Italian ingredients return None (no dictionary)."""
        assert get_ingredient_image_id("200g di farina", "it") is None
        assert get_ingredient_image_id("3 uova", "it") is None

    def test_unknown_language_returns_none(self):
        """Test unknown language code returns None."""
        assert get_ingredient_image_id("some ingredient", "xx") is None


class TestMatchingLogic:
    """Test the unified matching logic (same for all languages)."""

    def test_no_match_returns_none(self):
        """Test ingredients with no matches return None."""
        assert get_ingredient_image_id("foobar xyz unknown", "fr") is None
        assert get_ingredient_image_id("foobar xyz unknown", "en") is None

    def test_special_characters_handled(self):
        """Test that special characters are handled correctly."""
        # French: "d'olive" should still match
        assert get_ingredient_image_id("huile d'olive", "fr") == "olive-oil"

        # Parentheses should be removed
        assert get_ingredient_image_id("3 oeufs (gros)", "fr") == "egg"

    def test_case_insensitive(self):
        """Test matching is case-insensitive."""
        assert get_ingredient_image_id("FARINE", "fr") == "flour"
        assert get_ingredient_image_id("Farine", "fr") == "flour"
        assert get_ingredient_image_id("FLOUR", "en") == "flour"
        assert get_ingredient_image_id("Flour", "en") == "flour"

    def test_default_language_is_french(self):
        """Test that default language parameter is French."""
        # Without specifying language, should default to French
        assert get_ingredient_image_id("200g de farine") == "flour"
        assert get_ingredient_image_id("3 oeufs") == "egg"


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_empty_string(self):
        """Test empty ingredient string."""
        assert get_ingredient_image_id("", "fr") is None
        assert get_ingredient_image_id("", "en") is None

    def test_only_numbers(self):
        """Test ingredient with only numbers."""
        assert get_ingredient_image_id("200", "fr") is None
        assert get_ingredient_image_id("200g", "fr") is None

    def test_only_stopwords(self):
        """Test ingredient with only common words."""
        # "de" is a stopword but short words (< 2 chars) are filtered
        assert get_ingredient_image_id("de", "fr") is None
        assert get_ingredient_image_id("of", "en") is None

    def test_very_long_ingredient_text(self):
        """Test very long ingredient descriptions."""
        long_text = "Une très longue description avec beaucoup de mots mais à la fin farine"
        assert get_ingredient_image_id(long_text, "fr") == "flour"

        long_text_en = "A very long description with many words but at the end flour"
        assert get_ingredient_image_id(long_text_en, "en") == "flour"
