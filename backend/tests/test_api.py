import pytest
from unittest.mock import patch, AsyncMock
from app.schemas import ScrapedRecipe


@pytest.fixture
def mock_scraped_recipe():
    return ScrapedRecipe(
        url="https://www.marmiton.org/recettes/recette_gateau-chocolat.aspx",
        title="Gâteau au chocolat",
        description="Un délicieux gâteau au chocolat",
        image_url="https://example.com/image.jpg",
        ingredients=["200g chocolat", "100g beurre", "3 oeufs"],
        instructions=["Faire fondre le chocolat", "Mélanger avec les oeufs", "Cuire 25 minutes"],
        prep_time=15,
        cook_time=25,
        total_time=40,
        yields="6 personnes",
        host="marmiton.org",
    )


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_recipes_empty(client):
    response = client.get("/api/recipes")
    assert response.status_code == 200
    assert response.json() == []


def test_create_recipe(client, mock_scraped_recipe):
    with patch("app.main.scrape_recipe", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_scraped_recipe

        response = client.post(
            "/api/recipes",
            json={"url": "https://www.marmiton.org/recettes/recette_gateau-chocolat.aspx"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Gâteau au chocolat"
        assert data["host"] == "marmiton.org"
        assert len(data["ingredients"]) == 3


def test_create_recipe_duplicate(client, mock_scraped_recipe):
    """Test que la création d'une recette existante retourne la recette (pour l'extension Chrome)"""
    with patch("app.main.scrape_recipe", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_scraped_recipe

        first_response = client.post(
            "/api/recipes",
            json={"url": "https://www.marmiton.org/recettes/recette_gateau-chocolat.aspx"}
        )
        first_id = first_response.json()["id"]

        response = client.post(
            "/api/recipes",
            json={"url": "https://www.marmiton.org/recettes/recette_gateau-chocolat.aspx"}
        )

        # Doit retourner la recette existante (200) au lieu d'une erreur
        assert response.status_code == 200
        assert response.json()["id"] == first_id
        assert response.json()["title"] == "Gâteau au chocolat"


def test_get_recipe(client, mock_scraped_recipe):
    with patch("app.main.scrape_recipe", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_scraped_recipe

        create_response = client.post(
            "/api/recipes",
            json={"url": "https://www.marmiton.org/recettes/recette_gateau-chocolat.aspx"}
        )
        recipe_id = create_response.json()["id"]

        response = client.get(f"/api/recipes/{recipe_id}")

        assert response.status_code == 200
        assert response.json()["title"] == "Gâteau au chocolat"


def test_get_recipe_not_found(client):
    response = client.get("/api/recipes/999")
    assert response.status_code == 404


def test_delete_recipe(client, mock_scraped_recipe):
    with patch("app.main.scrape_recipe", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_scraped_recipe

        create_response = client.post(
            "/api/recipes",
            json={"url": "https://www.marmiton.org/recettes/recette_gateau-chocolat.aspx"}
        )
        recipe_id = create_response.json()["id"]

        response = client.delete(f"/api/recipes/{recipe_id}")
        assert response.status_code == 200

        get_response = client.get(f"/api/recipes/{recipe_id}")
        assert get_response.status_code == 404


def test_delete_recipe_not_found(client):
    response = client.delete("/api/recipes/999")
    assert response.status_code == 404


def test_list_recipes_with_data(client, mock_scraped_recipe):
    with patch("app.main.scrape_recipe", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = mock_scraped_recipe

        client.post(
            "/api/recipes",
            json={"url": "https://www.marmiton.org/recettes/recette_gateau-chocolat.aspx"}
        )

        response = client.get("/api/recipes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Gâteau au chocolat"
