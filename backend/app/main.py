import json
import os
import secrets
import string
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Environment, FileSystemLoader
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .schemas import ScrapeRequest, ScrapedRecipe, ShareRequest, ShareResponse
from .scraper import scrape_recipe, ScraperError, UnsupportedWebsiteError, FetchError
from .supported_domains import is_supported_url


def _client_ip(request: Request) -> str:
    """Return the real client IP, honoring X-Forwarded-For on Cloud Run.

    Cloud Run / GFE set X-Forwarded-For to "<client>, <proxy>, ..."; the
    first entry is the original caller. Falls back to the direct peer IP.
    """
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return get_remote_address(request)

try:
    from google.cloud import storage
    gcs_client = storage.Client()
    GCS_BUCKET = os.getenv("GCS_SHARED_BUCKET", "reciper-shared-recipes")
    gcs_bucket = gcs_client.bucket(GCS_BUCKET)
except Exception:
    gcs_client = None
    gcs_bucket = None

templates_dir = Path(__file__).parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(templates_dir)), autoescape=True)

app = FastAPI(
    title="Reciper API",
    description="API de scraping de recettes de cuisine",
    version="2.0.0",
)

# Rate limiting — keyed by client IP. Cloud Run forwards the real IP via
# X-Forwarded-For; slowapi's get_remote_address reads it when the request
# already has request.client set from the proxy chain.
limiter = Limiter(key_func=_client_ip, default_limits=["120/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: only allow Chrome extension origins. This is browser-enforced; the
# server-side Origin check below rejects non-extension callers entirely.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"^chrome-extension://[a-z]{32}$",
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def _require_extension_origin(request: Request) -> None:
    """Reject requests not originating from a Chrome extension.

    CORS only protects browsers; a scripted client can hit the endpoint with
    no Origin header. We enforce the check server-side as a second line of
    defense against the backend being used as a generic fetch proxy.
    """
    origin = request.headers.get("origin", "")
    if not origin.startswith("chrome-extension://"):
        raise HTTPException(status_code=403, detail="Forbidden")


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/api/scrape", response_model=ScrapedRecipe)
@limiter.limit("30/minute")
async def scrape(request: Request, data: ScrapeRequest):
    """Scrape a recipe from a URL and return the extracted data."""
    _require_extension_origin(request)
    url = str(data.url)

    if not data.wild_mode and not is_supported_url(url):
        raise HTTPException(status_code=400, detail="Site non supporté")

    try:
        scraped = await scrape_recipe(url, wild_mode=data.wild_mode)
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


def _generate_share_id(length: int = 8) -> str:
    """Generate a short URL-safe share ID."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


@app.post("/api/share", response_model=ShareResponse)
@limiter.limit("10/minute")
async def share_recipe(request: Request, data: ShareRequest):
    """Store a recipe in GCS and return a shareable URL."""
    _require_extension_origin(request)
    if gcs_bucket is None:
        raise HTTPException(status_code=503, detail="Sharing unavailable: GCS not configured")
    share_id = _generate_share_id()

    blob = gcs_bucket.blob(f"{share_id}.json")
    blob.upload_from_string(
        data.model_dump_json(),
        content_type="application/json",
    )

    base_url = str(request.base_url).rstrip("/")
    share_url = f"{base_url}/share/{share_id}"
    return ShareResponse(url=share_url)


@app.get("/share/{share_id}", response_class=HTMLResponse)
async def view_shared_recipe(share_id: str):
    """Serve a shared recipe as a responsive HTML page."""
    # Security: only allow alphanumeric IDs
    if not share_id.isalnum() or len(share_id) > 16:
        raise HTTPException(status_code=400, detail="Invalid share ID")

    if gcs_bucket is None:
        raise HTTPException(status_code=503, detail="Sharing unavailable: GCS not configured")

    blob = gcs_bucket.blob(f"{share_id}.json")

    if not blob.exists():
        raise HTTPException(status_code=404, detail="Recipe not found or link expired")

    recipe_data = json.loads(blob.download_as_text())
    template = jinja_env.get_template("share.html")
    html = template.render(recipe=recipe_data)
    return HTMLResponse(content=html)


# Static files mount (fonts, etc.) — must be after all routes
app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")
