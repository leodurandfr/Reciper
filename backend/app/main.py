from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from . import crud, schemas
from .database import engine, get_db, Base
from .scraper import scrape_recipe, ScraperError, UnsupportedWebsiteError, FetchError
from .ingredient_matcher import parse_instructions_with_ingredients


def migrate_add_is_favorite():
    """Add is_favorite column if it doesn't exist (for existing databases)."""
    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA table_info(recipes)"))
        columns = [row[1] for row in result.fetchall()]
        if "is_favorite" not in columns:
            conn.execute(text("ALTER TABLE recipes ADD COLUMN is_favorite BOOLEAN DEFAULT 0 NOT NULL"))
            conn.commit()


Base.metadata.create_all(bind=engine)
migrate_add_is_favorite()

app = FastAPI(
    title="RecettesScrapper API",
    description="API pour sauvegarder et organiser des recettes de cuisine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^chrome-extension://.*$",  # Extensions Chrome
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/recipes", response_model=schemas.RecipeBase)
async def create_recipe(recipe_create: schemas.RecipeCreate, db: Session = Depends(get_db)):
    url = str(recipe_create.url)

    # Si la recette existe déjà, la retourner (utile pour l'extension Chrome)
    existing = crud.get_recipe_by_url(db, url)
    if existing:
        return existing

    try:
        scraped = await scrape_recipe(url)
    except UnsupportedWebsiteError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FetchError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ScraperError as e:
        raise HTTPException(status_code=500, detail=f"Erreur de scraping: {str(e)}")

    db_recipe = crud.create_recipe(db, scraped)
    return db_recipe


@app.get("/api/recipes", response_model=list[schemas.RecipeListItem])
def list_recipes(skip: int = 0, limit: int = 100, favorites: bool = False, db: Session = Depends(get_db)):
    recipes = crud.get_recipes(db, skip=skip, limit=limit, favorites_only=favorites)
    return recipes


@app.get("/api/recipes/{recipe_id}", response_model=schemas.RecipeDetailResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = crud.get_recipe(db, recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recette non trouvée")

    # Match ingredients to instruction steps
    parsed_instructions = parse_instructions_with_ingredients(
        recipe.instructions, recipe.ingredients
    )

    # Convert to response model
    return schemas.RecipeDetailResponse(
        id=recipe.id,
        url=recipe.url,
        title=recipe.title,
        description=recipe.description,
        image_url=recipe.image_url,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        prep_time=recipe.prep_time,
        cook_time=recipe.cook_time,
        total_time=recipe.total_time,
        yields=recipe.yields,
        host=recipe.host,
        is_favorite=recipe.is_favorite,
        created_at=recipe.created_at,
        updated_at=recipe.updated_at,
        parsed_instructions=[
            schemas.InstructionStep(
                step_number=step["step_number"],
                text=step["text"],
                related_ingredients=step["related_ingredients"]
            )
            for step in parsed_instructions
        ]
    )


@app.patch("/api/recipes/{recipe_id}", response_model=schemas.RecipeDetailResponse)
def update_recipe(recipe_id: int, recipe_update: schemas.RecipeUpdate, db: Session = Depends(get_db)):
    recipe = crud.update_recipe(db, recipe_id, recipe_update)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recette non trouvée")

    # Match ingredients to instruction steps for response
    parsed_instructions = parse_instructions_with_ingredients(
        recipe.instructions, recipe.ingredients
    )

    return schemas.RecipeDetailResponse(
        id=recipe.id,
        url=recipe.url,
        title=recipe.title,
        description=recipe.description,
        image_url=recipe.image_url,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        prep_time=recipe.prep_time,
        cook_time=recipe.cook_time,
        total_time=recipe.total_time,
        yields=recipe.yields,
        host=recipe.host,
        is_favorite=recipe.is_favorite,
        created_at=recipe.created_at,
        updated_at=recipe.updated_at,
        parsed_instructions=[
            schemas.InstructionStep(
                step_number=step["step_number"],
                text=step["text"],
                related_ingredients=step["related_ingredients"]
            )
            for step in parsed_instructions
        ]
    )


@app.delete("/api/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    success = crud.delete_recipe(db, recipe_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recette non trouvée")
    return {"message": "Recette supprimée"}


@app.patch("/api/recipes/{recipe_id}/favorite", response_model=schemas.RecipeBase)
def toggle_favorite(recipe_id: int, db: Session = Depends(get_db)):
    recipe = crud.toggle_favorite(db, recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recette non trouvée")
    return recipe
