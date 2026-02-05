from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .schemas import ScrapeRequest, ScrapedRecipe
from .scraper import scrape_recipe, ScraperError, UnsupportedWebsiteError, FetchError


app = FastAPI(
    title="Reciper API",
    description="API de scraping de recettes de cuisine",
    version="2.0.0",
)

# CORS: only allow Chrome extension origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"^chrome-extension://.*$",
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/api/scrape", response_model=ScrapedRecipe)
async def scrape(request: ScrapeRequest):
    """Scrape a recipe from a URL and return the extracted data."""
    url = str(request.url)

    try:
        scraped = await scrape_recipe(url)
        return scraped
    except UnsupportedWebsiteError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FetchError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ScraperError as e:
        raise HTTPException(status_code=500, detail=f"Erreur de scraping: {str(e)}")


@app.get("/api/ingredients/images/{image_id}")
async def get_ingredient_image(image_id: str):
    """Serve an ingredient image."""
    # Security: validate image_id doesn't contain path traversal
    if '..' in image_id or '/' in image_id or '\\' in image_id:
        raise HTTPException(status_code=400, detail="Invalid image_id")

    # Look for PNG image
    image_path = Path(__file__).parent / "static" / "ingredients" / f"{image_id}.png"

    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        image_path,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=31536000"}  # Cache 1 year
    )
