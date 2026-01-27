# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RecettesScrapper is a recipe scraping and management application with three components:
- **Backend**: Python/FastAPI (port 8080)
- **Frontend**: Vue.js 3/Vite (port 5173)
- **Browser Extension**: Chrome Extension (Manifest V3)

The app scrapes recipes from 600+ supported websites using the `recipe-scrapers` library.

## Common Commands

### Backend (from `backend/` directory)
```bash
# Start development server
uvicorn app.main:app --reload

# Run all tests
pytest

# Run a single test file
pytest tests/test_api.py

# Run a specific test
pytest tests/test_api.py::test_create_recipe
```

### Frontend (from `frontend/` directory)
```bash
npm install        # Install dependencies
npm run dev        # Start dev server (localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
```

## Architecture

### Backend (`backend/app/`)
- `main.py` - FastAPI app with all route definitions and CORS configuration
- `models.py` - SQLAlchemy ORM models (single `Recipe` table)
- `schemas.py` - Pydantic schemas for request/response validation
- `database.py` - SQLite database configuration
- `scraper.py` - Recipe scraping logic with custom error classes (`ScraperError`, `UnsupportedWebsiteError`, `FetchError`)
- `crud.py` - Database CRUD operations

### Frontend (`frontend/src/`)
- `views/` - Page components (HomeView, RecipeView)
- `components/` - Reusable components (AddRecipeForm, RecipeCard, RecipeList, RecipeDetail)
- `services/api.js` - Axios client for backend communication

### Extension (`extension/`)
- Intercepts navigation to supported recipe sites
- Sends URL to backend for scraping
- Redirects user to local app on success
- Falls back to original site if backend unavailable

### API Endpoints
- `POST /api/recipes` - Add recipe by URL (deduplicates on URL)
- `GET /api/recipes` - List recipes (paginated: `skip`, `limit`)
- `GET /api/recipes/{id}` - Get recipe details
- `DELETE /api/recipes/{id}` - Delete recipe

### Database
SQLite with unique constraint on recipe URL. Database file: `backend/recipes.db` (test: `backend/test.db`).

## Key Dependencies
- `recipe-scrapers>=15.0.0` - Core scraping library
- `fastapi>=0.115.0` with `uvicorn[standard]`
- `sqlalchemy>=2.0.36` with SQLite
- Vue 3 with Vue Router and Axios

## Testing
Backend tests use pytest with async fixtures. The scraper is mocked in API tests. Test database is separate from production.
