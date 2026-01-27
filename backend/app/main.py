import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import ScrapeRequest, ScrapedRecipe
from .scraper import scrape_recipe, ScraperError, UnsupportedWebsiteError, FetchError


app = FastAPI(
    title="RecettesScrapper API",
    description="API de scraping de recettes de cuisine",
    version="2.0.0",
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"^chrome-extension://.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
