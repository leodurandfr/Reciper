"""Recipe scraping, run in the browser through Pyodide.

Ported from the former FastAPI backend (removed; see git history), except the
HTML is fetched by the extension and passed in, and the result is a plain dict
shaped like the old ScrapedRecipe schema.
"""

import json

from recipe_scrapers import scrape_html
from recipe_scrapers._exceptions import RecipeScrapersExceptions, WebsiteNotImplementedError

from .ingredient_image_matcher import get_ingredient_image_id
from .language_detection import get_language_from_domain


class ScraperError(Exception):
    pass


class UnsupportedWebsiteError(ScraperError):
    pass


def parse_time_to_minutes(time_value) -> int | None:
    """Convert time value to minutes."""
    if time_value is None:
        return None
    if isinstance(time_value, int):
        return time_value
    if isinstance(time_value, str):
        try:
            return int(time_value)
        except ValueError:
            return None
    return None


def _safe(getter, default=None):
    """Call a scraper field getter; a field the page does not provide gives `default`.

    recipe-scrapers raises its own exceptions (SchemaOrgException,
    ElementNotFoundInHtml...) for missing fields, not only NotImplementedError.
    """
    try:
        return getter()
    except (AttributeError, NotImplementedError, RecipeScrapersExceptions):
        return default


def scrape_recipe(html: str, url: str) -> dict:
    """Scrape a recipe from its page HTML using recipe-scrapers."""
    try:
        scraper = scrape_html(html, org_url=url)
    except WebsiteNotImplementedError:
        raise UnsupportedWebsiteError(f"Site non supporté: {url}")

    title = _safe(scraper.title) or "Sans titre"
    image_url = _safe(scraper.image)
    ingredients = _safe(scraper.ingredients, [])

    # Extract host and detect language
    host = scraper.host()
    detected_language = get_language_from_domain(host)

    # Enrich ingredients with image IDs using language-specific matching
    enriched_ingredients = [
        {"text": ing, "image_id": get_ingredient_image_id(ing, language=detected_language)}
        for ing in ingredients
    ]

    instructions_text = _safe(scraper.instructions)
    if isinstance(instructions_text, str):
        instructions = [step.strip() for step in instructions_text.split('\n') if step.strip()]
    else:
        instructions = list(instructions_text) if instructions_text else []

    return {
        "url": url,
        "title": title,
        "image_url": image_url,
        "ingredients": ingredients,
        "enriched_ingredients": enriched_ingredients,
        "instructions": instructions,
        "prep_time": parse_time_to_minutes(_safe(scraper.prep_time)),
        "cook_time": parse_time_to_minutes(_safe(scraper.cook_time)),
        "total_time": parse_time_to_minutes(_safe(scraper.total_time)),
        "yields": _safe(scraper.yields),
        "host": host,
    }


def scrape_recipe_json(html: str, url: str) -> str:
    """Entry point called from JavaScript: returns the recipe as JSON."""
    return json.dumps(scrape_recipe(html, url))
