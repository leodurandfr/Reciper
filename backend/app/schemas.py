from pydantic import BaseModel, HttpUrl


class ScrapeRequest(BaseModel):
    """Request body for scraping a recipe."""
    url: HttpUrl


class ScrapedRecipe(BaseModel):
    """Response model for a scraped recipe."""
    url: str
    title: str
    description: str | None = None
    image_url: str | None = None
    ingredients: list[str]
    instructions: list[str]
    prep_time: int | None = None
    cook_time: int | None = None
    total_time: int | None = None
    yields: str | None = None
    host: str
