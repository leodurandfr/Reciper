"""
Integration tests for recipe scraping with real URLs.

These tests hit actual recipe websites to verify end-to-end functionality.
They are marked with @pytest.mark.integration and should be run separately
from fast unit tests.

Run with: pytest tests/ -m integration -v

Note: These tests require the backend to be running on http://localhost:8742
"""

import pytest
import httpx

# Backend API base URL (must be running)
API_BASE_URL = "http://localhost:8742"


# Real URLs provided by the user for testing
TEST_URLS = [
    # Marmiton (FR)
    "https://www.marmiton.org/recettes/recette_gateau-au-chocolat-fondant-rapide_166352.aspx",
    "https://www.marmiton.org/recettes/recette_agneau-korma-inde_19199.aspx",
    "https://www.marmiton.org/recettes/recette_dal-lentilles-au-lait-de-coco_70773.aspx",
    "https://www.marmiton.org/recettes/recette_dahl-de-lentilles-corail_166862.aspx",
    "https://www.marmiton.org/recettes/recette_original-american-cookies-de-mike_39907.aspx",
    "https://www.marmiton.org/recettes/recette_gratin-dauphinois_13809.aspx",
    # CuisineAZ (FR)
    "https://www.cuisineaz.com/recettes/gratin-de-champignons-14697.aspx",
]


@pytest.mark.integration
@pytest.mark.asyncio
class TestScraperIntegration:
    """Integration tests with real recipe URLs."""

    async def test_scrape_marmiton_gateau_chocolat(self):
        """Test scraping Marmiton - Gâteau au chocolat."""
        url = "https://www.marmiton.org/recettes/recette_gateau-au-chocolat-fondant-rapide_166352.aspx"

        async with httpx.AsyncClient() as client:
            response = await client.post(f"{API_BASE_URL}/api/scrape", json={"url": url})

        assert response.status_code == 200, f"Failed to scrape: {response.text}"
        data = response.json()

        # Verify basic recipe data
        assert data["url"] == url
        assert data["host"] == "marmiton.org"
        assert data["title"], "Recipe should have a title"
        assert len(data["ingredients"]) > 0, "Recipe should have ingredients"

        # Verify ingredient enrichment
        enriched = data["enriched_ingredients"]
        assert len(enriched) > 0, "Should have enriched ingredients"

        # Check specific ingredients (gâteau chocolat should have chocolate, flour, or eggs)
        ingredient_texts = [ing["text"].lower() for ing in enriched]
        assert any("chocolat" in text for text in ingredient_texts), \
            "Chocolate cake should have chocolate"

        # Verify image IDs are assigned
        image_ids = [ing["image_id"] for ing in enriched if ing["image_id"]]
        assert len(image_ids) > 0, "At least some ingredients should be matched"

    async def test_scrape_marmiton_gratin_dauphinois(self):
        """Test scraping Marmiton - Gratin dauphinois (potato dish)."""
        url = "https://www.marmiton.org/recettes/recette_gratin-dauphinois_13809.aspx"

        async with httpx.AsyncClient() as client:
            response = await client.post(f"{API_BASE_URL}/api/scrape", json={"url": url})

        assert response.status_code == 200, f"Failed to scrape: {response.text}"
        data = response.json()

        # Verify basic data
        assert data["host"] == "marmiton.org"

        # Verify potato is detected (key ingredient)
        enriched = data["enriched_ingredients"]
        has_potato = any(
            "pomme" in ing["text"].lower() or ing["image_id"] == "potato"
            for ing in enriched
        )
        assert has_potato, "Gratin dauphinois should have potato"

    async def test_scrape_marmiton_dal_lentilles(self):
        """Test scraping Marmiton - Dal lentilles (lentil dish)."""
        url = "https://www.marmiton.org/recettes/recette_dal-lentilles-au-lait-de-coco_70773.aspx"

        async with httpx.AsyncClient() as client:
            response = await client.post(f"{API_BASE_URL}/api/scrape", json={"url": url})

        assert response.status_code == 200, f"Failed to scrape: {response.text}"
        data = response.json()

        # Verify lentils are detected
        enriched = data["enriched_ingredients"]
        has_lentils = any(
            "lentille" in ing["text"].lower() or ing["image_id"] == "lentil"
            for ing in enriched
        )
        assert has_lentils, "Dal should have lentils"

    async def test_scrape_marmiton_cookies(self):
        """Test scraping Marmiton - Cookies américains."""
        url = "https://www.marmiton.org/recettes/recette_original-american-cookies-de-mike_39907.aspx"

        async with httpx.AsyncClient() as client:
            response = await client.post(f"{API_BASE_URL}/api/scrape", json={"url": url})

        assert response.status_code == 200, f"Failed to scrape: {response.text}"
        data = response.json()

        # Verify basic ingredients for cookies
        enriched = data["enriched_ingredients"]
        ingredient_texts = [ing["text"].lower() for ing in enriched]

        # Cookies should have flour
        has_flour = any("farine" in text for text in ingredient_texts)
        assert has_flour, "Cookies should have flour"

    async def test_scrape_cuisineaz(self):
        """Test scraping CuisineAZ - Different French site."""
        url = "https://www.cuisineaz.com/recettes/gratin-de-champignons-14697.aspx"

        async with httpx.AsyncClient() as client:
            response = await client.post(f"{API_BASE_URL}/api/scrape", json={"url": url})

        assert response.status_code == 200, f"Failed to scrape: {response.text}"
        data = response.json()

        # Verify site-specific data
        assert data["host"] == "cuisineaz.com"
        assert len(data["ingredients"]) > 0, "Should have ingredients"

        # Verify mushrooms are detected
        enriched = data["enriched_ingredients"]
        has_mushroom = any(
            "champignon" in ing["text"].lower() or ing["image_id"] == "mushroom"
            for ing in enriched
        )
        assert has_mushroom, "Mushroom gratin should have mushrooms"

    @pytest.mark.parametrize("url", TEST_URLS)
    async def test_all_urls_scrape_successfully(self, url):
        """Verify all test URLs can be scraped without errors."""
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{API_BASE_URL}/api/scrape", json={"url": url})

        assert response.status_code == 200, f"Failed to scrape {url}: {response.text}"
        data = response.json()

        # Basic validation
        assert data["url"] == url
        assert data["host"] in ["marmiton.org", "cuisineaz.com"]
        assert data["title"], f"Recipe should have a title: {url}"
        assert len(data["ingredients"]) > 0, f"Recipe should have ingredients: {url}"
        assert len(data["enriched_ingredients"]) > 0, f"Should have enriched ingredients: {url}"


@pytest.mark.integration
@pytest.mark.asyncio
async def test_detected_language_not_in_response():
    """Verify that detected_language field is NOT exposed in API response (internal only)."""
    url = "https://www.marmiton.org/recettes/recette_gratin-dauphinois_13809.aspx"

    async with httpx.AsyncClient() as client:
        response = await client.post(f"{API_BASE_URL}/api/scrape", json={"url": url})

    assert response.status_code == 200
    data = response.json()

    # Verify language field does NOT exist in response
    assert "detected_language" not in data, \
        "detected_language should be internal only, not exposed in API response"


@pytest.mark.integration
@pytest.mark.asyncio
async def test_ingredient_matching_quality():
    """Verify that ingredient matching achieves reasonable quality (>30% match rate)."""
    url = "https://www.marmiton.org/recettes/recette_gratin-dauphinois_13809.aspx"

    async with httpx.AsyncClient() as client:
        response = await client.post(f"{API_BASE_URL}/api/scrape", json={"url": url})

    assert response.status_code == 200
    data = response.json()

    enriched = data["enriched_ingredients"]
    total_ingredients = len(enriched)
    matched_ingredients = sum(1 for ing in enriched if ing["image_id"] is not None)

    # At least 30% of ingredients should match
    match_rate = matched_ingredients / total_ingredients if total_ingredients > 0 else 0
    assert match_rate >= 0.3, \
        f"Match rate too low: {match_rate:.1%} ({matched_ingredients}/{total_ingredients})"
