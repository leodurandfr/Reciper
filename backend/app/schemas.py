from pydantic import BaseModel, ConfigDict, HttpUrl
from datetime import datetime


class RecipeCreate(BaseModel):
    url: HttpUrl


class RecipeUpdate(BaseModel):
    """Schema for updating a recipe via PATCH."""
    title: str | None = None
    description: str | None = None
    ingredients: list[str] | None = None
    instructions: list[str] | None = None
    prep_time: int | None = None
    cook_time: int | None = None
    yields: str | None = None


class InstructionStep(BaseModel):
    """Instruction step with related ingredients (raw strings)."""
    step_number: int
    text: str
    related_ingredients: list[str]


class RecipeBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    title: str
    description: str | None
    image_url: str | None
    ingredients: list[str]
    instructions: list[str]
    prep_time: int | None
    cook_time: int | None
    total_time: int | None
    yields: str | None
    host: str
    is_favorite: bool
    created_at: datetime
    updated_at: datetime


class RecipeDetailResponse(RecipeBase):
    """Extended recipe response with parsed instructions."""
    parsed_instructions: list[InstructionStep]


class RecipeListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    image_url: str | None
    prep_time: int | None
    cook_time: int | None
    total_time: int | None
    host: str
    is_favorite: bool
    created_at: datetime


class ScrapedRecipe(BaseModel):
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
