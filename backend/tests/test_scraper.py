import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import httpx

from app.scraper import (
    scrape_recipe,
    parse_time_to_minutes,
    UnsupportedWebsiteError,
    FetchError,
)


def test_parse_time_to_minutes_int():
    assert parse_time_to_minutes(30) == 30


def test_parse_time_to_minutes_string():
    assert parse_time_to_minutes("45") == 45


def test_parse_time_to_minutes_none():
    assert parse_time_to_minutes(None) is None


def test_parse_time_to_minutes_invalid_string():
    assert parse_time_to_minutes("invalid") is None


@pytest.mark.asyncio
async def test_scrape_recipe_success():
    mock_html = "<html><body>Recipe content</body></html>"

    mock_response = MagicMock()
    mock_response.text = mock_html
    mock_response.raise_for_status = MagicMock()

    mock_scraper = MagicMock()
    mock_scraper.title.return_value = "Test Recipe"
    mock_scraper.description.return_value = "A test description"
    mock_scraper.image.return_value = "https://example.com/image.jpg"
    mock_scraper.ingredients.return_value = ["ingredient 1", "ingredient 2"]
    mock_scraper.instructions.return_value = "Step 1\nStep 2"
    mock_scraper.prep_time.return_value = 10
    mock_scraper.cook_time.return_value = 20
    mock_scraper.total_time.return_value = 30
    mock_scraper.yields.return_value = "4 servings"
    mock_scraper.host.return_value = "example.com"

    with patch("app.scraper.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client_class.return_value = mock_client

        with patch("app.scraper.scrape_html", return_value=mock_scraper):
            result = await scrape_recipe("https://example.com/recipe")

            assert result.title == "Test Recipe"
            assert result.description == "A test description"
            assert len(result.ingredients) == 2
            assert len(result.instructions) == 2
            assert result.total_time == 30
            assert result.host == "example.com"


@pytest.mark.asyncio
async def test_scrape_recipe_fetch_error():
    with patch("app.scraper.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.HTTPError("Connection failed")
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client_class.return_value = mock_client

        with pytest.raises(FetchError):
            await scrape_recipe("https://example.com/recipe")


@pytest.mark.asyncio
async def test_scrape_recipe_unsupported_site():
    from recipe_scrapers._exceptions import WebsiteNotImplementedError

    mock_response = MagicMock()
    mock_response.text = "<html></html>"
    mock_response.raise_for_status = MagicMock()

    with patch("app.scraper.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client_class.return_value = mock_client

        with patch("app.scraper.scrape_html", side_effect=WebsiteNotImplementedError("unsupported.com")):
            with pytest.raises(UnsupportedWebsiteError):
                await scrape_recipe("https://unsupported.com/recipe")
