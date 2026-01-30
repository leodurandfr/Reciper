from recipe_scrapers import scrape_html
from recipe_scrapers._exceptions import WebsiteNotImplementedError
import httpx
from .schemas import ScrapedRecipe, EnrichedIngredient
from .ingredient_image_matcher import get_ingredient_image_id


class ScraperError(Exception):
    pass


class UnsupportedWebsiteError(ScraperError):
    pass


class FetchError(ScraperError):
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


async def scrape_recipe(url: str) -> ScrapedRecipe:
    """Scrape a recipe from a URL using recipe-scrapers library."""
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            )
            response.raise_for_status()
            html = response.text
    except httpx.HTTPError as e:
        raise FetchError(f"Impossible de récupérer la page: {str(e)}")

    try:
        scraper = scrape_html(html, org_url=url)
    except WebsiteNotImplementedError:
        raise UnsupportedWebsiteError(f"Site non supporté: {url}")

    title = scraper.title() or "Sans titre"

    try:
        description = scraper.description()
    except (AttributeError, NotImplementedError):
        description = None

    try:
        image_url = scraper.image()
    except (AttributeError, NotImplementedError):
        image_url = None

    try:
        ingredients = scraper.ingredients()
    except (AttributeError, NotImplementedError):
        ingredients = []

    # Enrich ingredients with image IDs
    enriched_ingredients = [
        EnrichedIngredient(
            text=ing,
            image_id=get_ingredient_image_id(ing)
        )
        for ing in ingredients
    ]

    try:
        instructions_text = scraper.instructions()
        if isinstance(instructions_text, str):
            instructions = [step.strip() for step in instructions_text.split('\n') if step.strip()]
        else:
            instructions = list(instructions_text) if instructions_text else []
    except (AttributeError, NotImplementedError):
        instructions = []

    try:
        prep_time = parse_time_to_minutes(scraper.prep_time())
    except (AttributeError, NotImplementedError):
        prep_time = None

    try:
        cook_time = parse_time_to_minutes(scraper.cook_time())
    except (AttributeError, NotImplementedError):
        cook_time = None

    try:
        total_time = parse_time_to_minutes(scraper.total_time())
    except (AttributeError, NotImplementedError):
        total_time = None

    try:
        yields = scraper.yields()
    except (AttributeError, NotImplementedError):
        yields = None

    host = scraper.host()

    return ScrapedRecipe(
        url=url,
        title=title,
        description=description,
        image_url=image_url,
        ingredients=ingredients,
        enriched_ingredients=enriched_ingredients,
        instructions=instructions,
        prep_time=prep_time,
        cook_time=cook_time,
        total_time=total_time,
        yields=yields,
        host=host,
    )
