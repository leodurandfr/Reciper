"""Recipe scraping, run in the browser through Pyodide.

The HTML is fetched by the extension and passed in; the result is a plain dict
(url, title, image_url, ingredients, enriched_ingredients, instructions, times,
yields, host) that the service worker stores as the recipe. A recipe without a
title gets title "": the service worker fills in a localized fallback.

Sites with a dedicated recipe-scrapers scraper use it; any other page is read
through its schema.org Recipe data (recipe-scrapers "wild mode"). Which pages get
here at all is decided by the service worker (supported sites, plus every site
when the "scrape any site" setting is on).
"""

import json
import math
from urllib.parse import urlparse

from recipe_scrapers import scrape_html
from recipe_scrapers._exceptions import NoSchemaFoundInWildMode
from recipe_scrapers._utils import normalize_string

from .ingredient_image_matcher import get_ingredient_image_id
from .language_detection import get_language_from_domain


class NoRecipeFoundError(Exception):
    pass


def parse_time_to_minutes(time_value) -> int | None:
    """Convert a recipe-scrapers time (minutes, as int or numeric string) to minutes."""
    if time_value is None or isinstance(time_value, bool):
        return None
    if isinstance(time_value, str):
        try:
            time_value = float(time_value)
        except ValueError:
            return None
    if isinstance(time_value, (int, float)) and math.isfinite(time_value):
        minutes = int(time_value)
        return minutes if minutes > 0 else None
    return None


def _safe(getter, default=None):
    """Call a scraper field getter; a field the page does not provide gives `default`.

    recipe-scrapers raises its own exceptions (SchemaOrgException,
    ElementNotFoundInHtml...) for missing fields, and dedicated scrapers may also
    raise KeyError/IndexError on pages they do not expect. Every field is optional,
    so any error only drops that field instead of failing the whole recipe.
    """
    try:
        value = getter()
    except Exception:
        return default
    return default if value is None else value


def _clean_lines(lines) -> list[str]:
    """Strip each line and drop the empty ones."""
    if isinstance(lines, str):
        lines = lines.split("\n")
    return [line.strip() for line in lines if isinstance(line, str) and line.strip()]


def _schema_instructions(scraper) -> list[str]:
    """Steps read directly from the schema.org recipeInstructions.

    Fallback for pages recipe-scrapers fails on: a single malformed step makes its
    instructions() raise, losing every step (e.g. Jow nests a list of HowToTip in
    its last HowToStep).
    """
    schema = getattr(scraper, "schema", None)
    data = getattr(schema, "data", None) or {}

    def extract(item) -> list[str]:
        if isinstance(item, str):
            return [item]
        if isinstance(item, list):
            return [text for sub_item in item for text in extract(sub_item)]
        if not isinstance(item, dict):
            return []
        types = item.get("@type")
        types = types if isinstance(types, list) else [types]
        if "HowToSection" in types:
            name = item.get("name")
            return ([name] if isinstance(name, str) else []) + extract(item.get("itemListElement"))
        if "HowToStep" in types or "@type" not in item:
            text = item.get("text") or item.get("name")
            return [text] if isinstance(text, str) else []
        return []  # HowToTip, vidéos…

    return _clean_lines(normalize_string(text) for text in extract(data.get("recipeInstructions")))


def _host_of(url: str) -> str:
    """Host of the recipe URL, without "www." (recipe-scrapers' convention)."""
    return (urlparse(url).hostname or "").removeprefix("www.")


def scrape_recipe(html: str, url: str) -> dict:
    """Scrape a recipe from its page HTML using recipe-scrapers."""
    try:
        scraper = scrape_html(html, org_url=url, supported_only=False)
    except NoSchemaFoundInWildMode:
        raise NoRecipeFoundError(f"No recipe found on this page: {url}")

    title = _safe(scraper.title, "").strip()
    ingredients = _clean_lines(_safe(scraper.ingredients, []))
    instructions = _clean_lines(_safe(scraper.instructions_list, [])) or _schema_instructions(scraper)
    if not ingredients and not instructions:
        raise NoRecipeFoundError(f"No recipe found on this page: {url}")

    host = _host_of(url)
    language = get_language_from_domain(host, page_language=_safe(scraper.language))

    return {
        "url": url,
        "title": title,
        "image_url": _safe(scraper.image) or None,
        "ingredients": ingredients,
        "enriched_ingredients": [
            {"text": ingredient, "image_id": get_ingredient_image_id(ingredient, language=language)}
            for ingredient in ingredients
        ],
        "instructions": instructions,
        "prep_time": parse_time_to_minutes(_safe(scraper.prep_time)),
        "cook_time": parse_time_to_minutes(_safe(scraper.cook_time)),
        "total_time": parse_time_to_minutes(_safe(scraper.total_time)),
        "yields": _safe(scraper.yields) or None,
        "host": host,
    }


def scrape_recipe_json(html: str, url: str) -> str:
    """Entry point called from JavaScript: returns the recipe as JSON."""
    return json.dumps(scrape_recipe(html, url))
