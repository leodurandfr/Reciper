#!/usr/bin/env python3
"""
Tests to verify dictionary cleanup - ensure ambiguous terms don't cause false positives.
"""

from app.ingredient_image_matcher import get_ingredient_image_id


def run_test(name, test_func):
    """Run a single test and report results."""
    try:
        test_func()
        print(f"✅ {name}")
        return True
    except AssertionError as e:
        print(f"❌ {name}: {e}")
        return False


class TestAmbiguousModifiersRemoved:
    """Tests that color/qualifier adjectives don't override actual ingredients."""

    def test_rouge_removed_from_dictionary(self):
        """'rouge' should be removed as it's too generic (red)."""
        # "rouge" alone should not match anything
        result = get_ingredient_image_id("rouge")
        assert result != "kidney-bean", "'rouge' alone should not match kidney-bean"

    def test_tomate_rouge_matches_tomato(self):
        """'tomate rouge' should match 'tomato', not be overridden by 'rouge'."""
        result = get_ingredient_image_id("tomate rouge")
        assert result == "tomato", f"Expected 'tomato', got {result}"

    def test_oignon_rouge_matches_onion(self):
        """'oignon rouge' should match 'onion', not be overridden by 'rouge'."""
        result = get_ingredient_image_id("oignon rouge")
        assert result == "onion", f"Expected 'onion', got {result}"

    def test_vin_rouge_matches_wine(self):
        """'vin rouge' should match 'wine', not be overridden by 'rouge'."""
        result = get_ingredient_image_id("vin rouge")
        assert result == "wine", f"Expected 'wine', got {result}"

    def test_haricot_rouge_still_works(self):
        """'haricot rouge' should still work (handled by compound pattern or multi-word)."""
        result = get_ingredient_image_id("haricot rouge")
        # Should match either 'green-bean' (from haricot) or ideally 'kidney-bean' from compound
        assert result in ["green-bean", "kidney-bean"], f"Expected bean match, got {result}"


class TestShortWordsAreIngredients:
    """Verify short words are kept because they're real ingredients."""

    def test_bar_is_sea_bass(self):
        """'bar' (sea bass) is a real fish ingredient."""
        result = get_ingredient_image_id("bar")
        assert result == "sea-bass", f"Expected 'sea-bass', got {result}"

    def test_vin_is_wine(self):
        """'vin' (wine) is a real ingredient."""
        result = get_ingredient_image_id("vin")
        assert result == "wine", f"Expected 'wine', got {result}"

    def test_lin_is_flax_seed(self):
        """'lin' (flax) is a real seed ingredient."""
        result = get_ingredient_image_id("lin")
        assert result == "flax-seed", f"Expected 'flax-seed', got {result}"


class TestRealWorldRecipes:
    """Test real-world recipe ingredient strings."""

    def test_poisson_blanc_with_cabillaud(self):
        """Real case: '4 filets de Poisson blanc charnus (dos de cabillaud)'."""
        result = get_ingredient_image_id("4 filets de Poisson blanc charnus (dos de cabillaud)")
        assert result == "cod", f"Expected 'cod', got {result}"

    def test_yaourt_farine(self):
        """Real case: '2½ pots de yaourt vides de farine'."""
        result = get_ingredient_image_id("2½ pots de yaourt vides de farine")
        assert result == "flour", f"Expected 'flour', got {result}"

    def test_saumon_fume(self):
        """'saumon fumé' should match 'salmon' (if 'fumé' removed)."""
        result = get_ingredient_image_id("200g de saumon fumé")
        assert result == "salmon", f"Expected 'salmon', got {result}"

    def test_tomate_cerise(self):
        """'tomate cerise' should match 'tomato' (main ingredient first)."""
        result = get_ingredient_image_id("tomate cerise")
        # Could match 'tomato' or 'cherry' - ideally 'tomato'
        assert result in ["tomato", "cherry"], f"Expected tomato or cherry, got {result}"


if __name__ == "__main__":
    # Run all tests
    print("=" * 70)
    print("DICTIONARY CLEANUP TESTS")
    print("=" * 70)

    tests_passed = 0
    tests_failed = 0

    # Test ambiguous modifiers removed
    print("\n## Ambiguous Modifiers Removed")
    test_obj = TestAmbiguousModifiersRemoved()
    if run_test("rouge removed from dictionary", test_obj.test_rouge_removed_from_dictionary):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("tomate rouge matches tomato", test_obj.test_tomate_rouge_matches_tomato):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("oignon rouge matches onion", test_obj.test_oignon_rouge_matches_onion):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("vin rouge matches wine", test_obj.test_vin_rouge_matches_wine):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("haricot rouge still works", test_obj.test_haricot_rouge_still_works):
        tests_passed += 1
    else:
        tests_failed += 1

    # Test short words are kept
    print("\n## Short Words Are Real Ingredients")
    test_obj2 = TestShortWordsAreIngredients()
    if run_test("bar is sea-bass", test_obj2.test_bar_is_sea_bass):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("vin is wine", test_obj2.test_vin_is_wine):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("lin is flax-seed", test_obj2.test_lin_is_flax_seed):
        tests_passed += 1
    else:
        tests_failed += 1

    # Test real-world recipes
    print("\n## Real-World Recipe Cases")
    test_obj3 = TestRealWorldRecipes()
    if run_test("poisson blanc with cabillaud", test_obj3.test_poisson_blanc_with_cabillaud):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("yaourt farine", test_obj3.test_yaourt_farine):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("saumon fumé", test_obj3.test_saumon_fume):
        tests_passed += 1
    else:
        tests_failed += 1

    if run_test("tomate cerise", test_obj3.test_tomate_cerise):
        tests_passed += 1
    else:
        tests_failed += 1

    # Summary
    print("\n" + "=" * 70)
    print(f"SUMMARY: {tests_passed} passed, {tests_failed} failed")
    print("=" * 70)

    exit(0 if tests_failed == 0 else 1)
