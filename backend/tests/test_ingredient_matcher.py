"""Tests for the ingredient matcher module."""

import pytest
from app.ingredient_matcher import (
    match_ingredients_to_step,
    parse_instructions_with_ingredients,
    _is_empty_step_marker,
    _clean_step_text,
)


class TestMatchIngredientsToStep:
    """Tests for match_ingredients_to_step function."""

    def test_finds_matching_ingredient(self):
        ingredients = ["200g chocolat", "3 oeufs"]
        step = "Faire fondre le chocolat au bain-marie"
        matched = match_ingredients_to_step(step, ingredients)
        assert len(matched) == 1
        assert matched[0] == "200g chocolat"

    def test_finds_multiple_matching_ingredients(self):
        ingredients = ["200g chocolat", "100g beurre"]
        step = "Mélanger le chocolat fondu avec le beurre"
        matched = match_ingredients_to_step(step, ingredients)
        assert len(matched) == 2

    def test_no_match(self):
        ingredients = ["200g chocolat"]
        step = "Préchauffer le four à 180°C"
        matched = match_ingredients_to_step(step, ingredients)
        assert len(matched) == 0

    def test_case_insensitive_matching(self):
        ingredients = ["3 Oeufs"]
        step = "Battre les oeufs en neige"
        matched = match_ingredients_to_step(step, ingredients)
        assert len(matched) == 1

    def test_ignores_short_words(self):
        """Short words (<=3 chars) should not match."""
        ingredients = ["sel fin"]  # "sel" is only 3 chars
        step = "Ajouter du sel"
        matched = match_ingredients_to_step(step, ingredients)
        # "sel" is too short, but if there's a longer word it should match
        assert len(matched) == 0

    def test_matches_on_significant_words(self):
        """Should match on significant words (>3 chars)."""
        ingredients = ["2 gousses d'ail", "huile d'olive"]
        step = "Faire revenir l'ail dans l'huile"
        matched = match_ingredients_to_step(step, ingredients)
        # "ail" is only 3 chars, "huile" should match
        assert "huile d'olive" in matched

    def test_ignores_numbers_and_units(self):
        """Numbers and common units should not be used for matching."""
        ingredients = ["200g farine", "100ml lait"]
        step = "Mélanger 200g de sucre"
        matched = match_ingredients_to_step(step, ingredients)
        # Should not match just because "200g" appears
        assert len(matched) == 0


class TestParseInstructionsWithIngredients:
    """Tests for parse_instructions_with_ingredients function."""

    def test_parses_all_steps(self):
        instructions = ["Préchauffer le four", "Mélanger les ingrédients", "Enfourner"]
        ingredients = ["ingredient"]
        result = parse_instructions_with_ingredients(instructions, ingredients)
        assert len(result) == 3
        assert result[0]["step_number"] == 1
        assert result[1]["step_number"] == 2
        assert result[2]["step_number"] == 3

    def test_matches_ingredients_to_steps(self):
        instructions = [
            "Faire fondre le chocolat",
            "Battre les oeufs",
            "Mélanger le tout",
        ]
        ingredients = ["200g chocolat", "3 oeufs"]
        result = parse_instructions_with_ingredients(instructions, ingredients)

        assert "200g chocolat" in result[0]["related_ingredients"]
        assert "3 oeufs" in result[1]["related_ingredients"]

    def test_step_with_no_ingredients(self):
        instructions = ["Préchauffer le four à 180°C"]
        ingredients = ["200g chocolat", "3 oeufs"]
        result = parse_instructions_with_ingredients(instructions, ingredients)

        assert result[0]["related_ingredients"] == []


class TestIsEmptyStepMarker:
    """Tests for _is_empty_step_marker function."""

    def test_etape_with_number(self):
        assert _is_empty_step_marker("Étape 1") is True
        assert _is_empty_step_marker("étape 2") is True
        assert _is_empty_step_marker("Etape 3") is True
        assert _is_empty_step_marker("etape 4") is True

    def test_step_with_number(self):
        assert _is_empty_step_marker("Step 1") is True
        assert _is_empty_step_marker("step 2") is True

    def test_number_only(self):
        assert _is_empty_step_marker("1") is True
        assert _is_empty_step_marker("2.") is True
        assert _is_empty_step_marker("3") is True

    def test_with_trailing_dot(self):
        assert _is_empty_step_marker("Étape 1.") is True
        assert _is_empty_step_marker("Step 2.") is True

    def test_with_whitespace(self):
        assert _is_empty_step_marker("  Étape 1  ") is True
        assert _is_empty_step_marker("  Step 2  ") is True

    def test_not_empty_marker_with_content(self):
        assert _is_empty_step_marker("Étape 1: Préchauffez le four") is False
        assert _is_empty_step_marker("Step 2. Mix well") is False
        assert _is_empty_step_marker("Préchauffez le four") is False

    def test_section_header_preserved(self):
        # Section headers like "1 : Préparation" should NOT be treated as empty
        assert _is_empty_step_marker("1 : Préparation du chou-fleur") is False


class TestCleanStepText:
    """Tests for _clean_step_text function."""

    def test_removes_etape_prefix(self):
        assert _clean_step_text("Étape 1: Préchauffez le four") == "Préchauffez le four"
        assert _clean_step_text("étape 2. Mélangez bien") == "Mélangez bien"
        assert _clean_step_text("Etape 3 - Enfournez") == "Enfournez"

    def test_removes_step_prefix(self):
        assert _clean_step_text("Step 1: Preheat the oven") == "Preheat the oven"
        assert _clean_step_text("step 2. Mix well") == "Mix well"
        assert _clean_step_text("Step 3 - Bake") == "Bake"

    def test_handles_various_separators(self):
        assert _clean_step_text("Étape 1: texte") == "texte"
        assert _clean_step_text("Étape 1. texte") == "texte"
        assert _clean_step_text("Étape 1- texte") == "texte"
        assert _clean_step_text("Étape 1– texte") == "texte"  # en-dash
        assert _clean_step_text("Étape 1— texte") == "texte"  # em-dash

    def test_preserves_text_without_prefix(self):
        assert _clean_step_text("Préchauffez le four") == "Préchauffez le four"
        assert _clean_step_text("Mix well") == "Mix well"

    def test_preserves_section_headers(self):
        # Section headers like "1 : Préparation" should be preserved
        # because they don't start with "Étape" or "Step"
        assert _clean_step_text("1 : Préparation du chou-fleur") == "1 : Préparation du chou-fleur"

    def test_strips_whitespace(self):
        assert _clean_step_text("  Étape 1: Préchauffez  ") == "Préchauffez"


class TestParseInstructionsFiltering:
    """Tests for step filtering in parse_instructions_with_ingredients."""

    def test_filters_empty_step_markers(self):
        instructions = [
            "Étape 1",
            "Préchauffez le four",
            "Étape 2",
            "Mélangez les ingrédients",
        ]
        ingredients = []
        result = parse_instructions_with_ingredients(instructions, ingredients)

        assert len(result) == 2
        assert result[0]["text"] == "Préchauffez le four"
        assert result[0]["step_number"] == 1
        assert result[1]["text"] == "Mélangez les ingrédients"
        assert result[1]["step_number"] == 2

    def test_cleans_step_prefixes(self):
        instructions = [
            "Étape 1: Préchauffez le four",
            "Step 2. Mix the ingredients",
        ]
        ingredients = []
        result = parse_instructions_with_ingredients(instructions, ingredients)

        assert len(result) == 2
        assert result[0]["text"] == "Préchauffez le four"
        assert result[1]["text"] == "Mix the ingredients"

    def test_renumbers_after_filtering(self):
        instructions = [
            "Étape 1",  # filtered
            "Step 2",   # filtered
            "First real step",
            "3",        # filtered
            "Second real step",
        ]
        ingredients = []
        result = parse_instructions_with_ingredients(instructions, ingredients)

        assert len(result) == 2
        assert result[0]["step_number"] == 1
        assert result[0]["text"] == "First real step"
        assert result[1]["step_number"] == 2
        assert result[1]["text"] == "Second real step"

    def test_preserves_section_headers(self):
        instructions = [
            "1 : Préparation du chou-fleur",
            "Couper le chou-fleur en morceaux",
            "2 : Cuisson",
            "Faire cuire à la vapeur",
        ]
        ingredients = []
        result = parse_instructions_with_ingredients(instructions, ingredients)

        assert len(result) == 4
        assert result[0]["text"] == "1 : Préparation du chou-fleur"
        assert result[1]["text"] == "Couper le chou-fleur en morceaux"

    def test_ingredient_matching_uses_cleaned_text(self):
        instructions = ["Étape 1: Faire fondre le chocolat"]
        ingredients = ["200g chocolat"]
        result = parse_instructions_with_ingredients(instructions, ingredients)

        assert result[0]["text"] == "Faire fondre le chocolat"
        assert "200g chocolat" in result[0]["related_ingredients"]
