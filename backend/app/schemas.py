from pydantic import BaseModel, HttpUrl


class ScrapeRequest(BaseModel):
    """Request body for scraping a recipe."""
    url: HttpUrl


class EnrichedIngredient(BaseModel):
    """Ingredient enriched with image metadata."""
    text: str  # Original text (e.g., "200g farine")
    image_id: str | None = None  # Image identifier (e.g., "flour")


class ScrapedRecipe(BaseModel):
    """Response model for a scraped recipe."""
    url: str
    title: str
    description: str | None = None
    image_url: str | None = None
    ingredients: list[str]  # Kept for backward compatibility
    enriched_ingredients: list[EnrichedIngredient] = []  # NEW: Ingredients with image IDs
    instructions: list[str]
    prep_time: int | None = None
    cook_time: int | None = None
    total_time: int | None = None
    yields: str | None = None
    host: str
