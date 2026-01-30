#!/usr/bin/env python3
"""
Script de test pour valider le système d'enrichissement d'ingrédients.
"""

from app.ingredient_image_matcher import get_ingredient_image_id, extract_keywords

def test_multilingual_matching():
    """Test le matching multilingue."""
    print("=" * 60)
    print("TEST 1: Matching multilingue")
    print("=" * 60)

    tests = [
        ("200g de farine", "flour", "🇫🇷 Français"),
        ("2 tomatoes", "tomato", "🇬🇧 English"),
        ("1 Zwiebel", "onion", "🇩🇪 Deutsch"),
        ("3 tomates", "tomato", "🇫🇷 Français (pluriel)"),
        ("500ml de lait", "milk", "🇫🇷 Français"),
        ("2 œufs", "egg", "🇫🇷 Français (accent)"),
        ("1 cup sugar", "sugar", "🇬🇧 English"),
        ("obscure exotic ingredient", None, "❌ Inconnu"),
    ]

    for ingredient, expected, description in tests:
        result = get_ingredient_image_id(ingredient)
        status = "✅" if result == expected else "❌"
        print(f"{status} {description:25} | {ingredient:30} → {result}")

    print()


def test_keyword_extraction():
    """Test l'extraction de mots-clés."""
    print("=" * 60)
    print("TEST 2: Extraction de mots-clés")
    print("=" * 60)

    tests = [
        "200g de farine",
        "2 cuillères à soupe d'huile d'olive",
        "3 oeufs entiers",
        "1/2 tasse de sucre",
    ]

    for ingredient in tests:
        keywords = extract_keywords(ingredient)
        print(f"  {ingredient:40} → {keywords}")

    print()


def test_coverage():
    """Test la couverture du dictionnaire."""
    print("=" * 60)
    print("TEST 3: Couverture du dictionnaire")
    print("=" * 60)

    from app.data.ingredient_mapping import INGREDIENT_DATABASE

    print(f"📊 Nombre d'ingrédients dans le dictionnaire: {len(INGREDIENT_DATABASE)}")
    print(f"📋 Ingrédients disponibles:")

    for image_id, data in sorted(INGREDIENT_DATABASE.items()):
        category = data['category']
        fr_keywords = ', '.join(data['keywords']['fr'][:3])  # Premiers 3 mots-clés FR
        print(f"  • {image_id:15} ({category:10}) - FR: {fr_keywords}")

    print()


def test_recipe_example():
    """Test avec un exemple de recette réelle."""
    print("=" * 60)
    print("TEST 4: Exemple de recette (Pâte à crêpes)")
    print("=" * 60)

    recipe_ingredients = [
        "300 g de farine",
        "3 oeufs entiers",
        "3 cuillères à soupe de sucre",
        "2 cuillères à soupe d'huile",
        "50 g de beurre fondu",
        "60 cl de lait",
        "1 pincée de sel",
    ]

    print("Ingrédients enrichis:")
    matched = 0
    for ing in recipe_ingredients:
        image_id = get_ingredient_image_id(ing)
        if image_id:
            matched += 1
            print(f"  ✅ {ing:35} → {image_id}")
        else:
            print(f"  ⚪ {ing:35} → (pas d'image)")

    coverage = (matched / len(recipe_ingredients)) * 100
    print(f"\n📈 Couverture: {matched}/{len(recipe_ingredients)} ({coverage:.1f}%)")
    print()


if __name__ == "__main__":
    print("\n🧪 TESTS DU SYSTÈME D'ENRICHISSEMENT D'INGRÉDIENTS\n")

    test_multilingual_matching()
    test_keyword_extraction()
    test_coverage()
    test_recipe_example()

    print("=" * 60)
    print("✨ Tests terminés!")
    print("=" * 60)
    print("\nPour tester l'API complète:")
    print("  1. Démarrer le backend: ./venv/bin/uvicorn app.main:app --reload --port 8742")
    print("  2. Scraper une recette: curl -X POST http://localhost:8742/api/scrape ...")
    print("  3. Ajouter vos images PNG dans: static/ingredients/")
    print()
