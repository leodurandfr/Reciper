from sqlalchemy.orm import Session
from . import models, schemas


def get_recipe(db: Session, recipe_id: int) -> models.Recipe | None:
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def get_recipe_by_url(db: Session, url: str) -> models.Recipe | None:
    return db.query(models.Recipe).filter(models.Recipe.url == url).first()


def get_recipes(db: Session, skip: int = 0, limit: int = 100, favorites_only: bool = False) -> list[models.Recipe]:
    query = db.query(models.Recipe)
    if favorites_only:
        query = query.filter(models.Recipe.is_favorite == True)
    return query.order_by(models.Recipe.created_at.desc()).offset(skip).limit(limit).all()


def create_recipe(db: Session, recipe: schemas.ScrapedRecipe) -> models.Recipe:
    db_recipe = models.Recipe(
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
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


def delete_recipe(db: Session, recipe_id: int) -> bool:
    recipe = get_recipe(db, recipe_id)
    if recipe:
        db.delete(recipe)
        db.commit()
        return True
    return False


def toggle_favorite(db: Session, recipe_id: int) -> models.Recipe | None:
    recipe = get_recipe(db, recipe_id)
    if recipe:
        recipe.is_favorite = not recipe.is_favorite
        db.commit()
        db.refresh(recipe)
        return recipe
    return None


def update_recipe(db: Session, recipe_id: int, recipe_update: schemas.RecipeUpdate) -> models.Recipe | None:
    """Update a recipe with the provided fields."""
    recipe = get_recipe(db, recipe_id)
    if not recipe:
        return None

    update_data = recipe_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(recipe, field, value)

    # Update total_time if prep_time or cook_time changed
    if "prep_time" in update_data or "cook_time" in update_data:
        prep = recipe.prep_time or 0
        cook = recipe.cook_time or 0
        recipe.total_time = prep + cook if (prep or cook) else None

    db.commit()
    db.refresh(recipe)
    return recipe
