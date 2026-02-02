#!/usr/bin/env python3
"""
Script de test pour valider le système d'enrichissement d'ingrédients.
"""

from app.ingredient_image_matcher import get_ingredient_image_id, extract_keywords

def test_multilingual_matching():
    """Test le matching FR→EN avec le nouveau dictionnaire."""
    print("=" * 60)
    print("TEST 1: Matching FR→EN (nouveau dictionnaire)")
    print("=" * 60)

    tests = [
        # Légumes
        ("200g de tomates", "tomato", "🥕 Légumes"),
        ("1 oignon", "onion", "🥕 Légumes"),
        ("2 gousses d'ail", "garlic", "🥕 Légumes"),
        ("500g de pommes de terre", "potato", "🥕 Légumes"),
        ("3 carottes", "carrot", "🥕 Légumes"),
        ("1 courgette", "zucchini", "🥕 Légumes"),

        # Fruits
        ("2 pommes", "apple", "🍎 Fruits"),  # "pomme" → "apple" (fruit)
        ("1 citron", "lemon", "🍎 Fruits"),
        ("100g de fraises", "strawberry", "🍎 Fruits"),

        # Produits de base
        ("200g de farine", "flour", "🌾 Produits de base"),
        ("100g de sucre", "sugar", "🌾 Produits de base"),
        ("1 pincée de sel", "salt", "🌾 Produits de base"),
        ("1 cuillère de poivre", "pepper", "🌾 Produits de base"),

        # Produits laitiers
        ("500ml de lait", "milk", "🥛 Produits laitiers"),
        ("100g de beurre", "butter", "🥛 Produits laitiers"),
        ("3 œufs", "egg", "🥛 Produits laitiers"),
        ("200g de crème fraîche", "cream", "🥛 Produits laitiers"),

        # Viandes
        ("300g de poulet", "chicken", "🍗 Viandes"),
        ("500g de bœuf", "beef", "🍗 Viandes"),

        # Herbes & épices
        ("Quelques feuilles de basilic", "basil", "🌿 Herbes & épices"),
        ("1 bouquet de persil", "parsley", "🌿 Herbes & épices"),
        ("1 cuillère de curry", "curry", "🌿 Herbes & épices"),

        # Condiments
        ("2 cuillères d'huile d'olive", "olive-oil", "🫗 Condiments"),
        ("1 cuillère de moutarde", "mustard", "🫗 Condiments"),

        # Bug fixes
        ("3 Œuf(s)", "egg", "🐛 Bug fix - Parenthèses"),
        ("béchamel", "bechamel", "🐛 Bug fix - Sauce manquante"),

        # Inconnu
        ("obscure exotic ingredient", None, "❌ Inconnu"),
    ]

    passed = 0
    failed = 0
    for ingredient, expected, description in tests:
        result = get_ingredient_image_id(ingredient)
        status = "✅" if result == expected else "❌"
        if result == expected:
            passed += 1
        else:
            failed += 1
        print(f"{status} {description:25} | {ingredient:40} → {result or 'None'}")

    print(f"\n📊 Résultats: {passed} passés, {failed} échoués ({passed/(passed+failed)*100:.1f}% de succès)")
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
    """Test la couverture du nouveau dictionnaire FR→EN."""
    print("=" * 60)
    print("TEST 3: Couverture du dictionnaire FR→EN")
    print("=" * 60)

    from app.data.translations.fr_to_en import FR_TO_EN

    # Compter les ingrédients uniques (valeurs distinctes)
    unique_ingredients = set(FR_TO_EN.values())

    print(f"📊 Nombre total d'entrées dans le dictionnaire: {len(FR_TO_EN)}")
    print(f"📊 Nombre d'ingrédients uniques (images nécessaires): {len(unique_ingredients)}")

    print(f"\n📋 Exemples d'entrées par catégorie:")

    # Grouper par catégorie
    categories = {
        'Légumes': ['tomate', 'oignon', 'ail', 'carotte', 'courgette'],
        'Fruits': ['pomme', 'citron', 'fraise', 'banane', 'orange'],
        'Viandes': ['poulet', 'boeuf', 'porc', 'agneau', 'canard'],
        'Produits laitiers': ['lait', 'beurre', 'oeuf', 'fromage', 'crème'],
        'Épices': ['sel', 'poivre', 'basilic', 'persil', 'thym'],
    }

    for category, examples in categories.items():
        matches = [(fr, FR_TO_EN[fr]) for fr in examples if fr in FR_TO_EN]
        if matches:
            print(f"\n  {category}:")
            for fr, en in matches[:5]:
                print(f"    • '{fr}' → '{en}'")

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
