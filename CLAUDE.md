# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Reciper** is a recipe scraping and management application with two components:
- **Backend**: Python/FastAPI API for scraping (deployable via Docker)
- **Extension**: Chrome Extension (Manifest V3) with Vue.js frontend and IndexedDB storage

The app scrapes recipes from 600+ supported websites using the `recipe-scrapers` library.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CHROME EXTENSION                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Frontend   │  │   IndexedDB  │  │  Service Worker  │   │
│  │   (Vue.js)   │  │  (ReciperDB) │  │  (Interception)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/scrape
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Docker on NAS / localhost)             │
│                 FastAPI + recipe-scrapers                    │
│                    (No database)                             │
└─────────────────────────────────────────────────────────────┘
```

## Common Commands

### Backend (from `backend/` directory)
```bash
# Development (Mac)
uvicorn app.main:app --reload --port 8080

# Production (Docker)
docker-compose up -d --build
```

### Extension (from `extension/` directory)
```bash
npm install           # Install dependencies
npm run build         # Build to dist/
npm run build:watch   # Build with watch mode
```

Load extension in Chrome: `chrome://extensions/` > Load unpacked > select `extension/dist/`

## Project Structure

### Backend (`backend/`)
- `app/main.py` - FastAPI app with `/api/scrape` and `/api/health` endpoints
- `app/scraper.py` - Recipe scraping logic using `recipe-scrapers`
- `app/schemas.py` - Pydantic schemas (ScrapeRequest, ScrapedRecipe)
- `Dockerfile` + `docker-compose.yml` - Docker deployment

### Extension (`extension/`)
- `src/` - Vue.js source code
  - `views/` - HomeView, RecipeView, SettingsView
  - `components/` - UI components
  - `services/db.js` - IndexedDB operations
  - `services/api.js` - Backend API calls
  - `stores/settings.js` - User settings (backend URL, theme)
- `service-worker.js` - Intercepts recipe site navigation
- `popup.html/js` - Extension popup
- `manifest.json` - Chrome extension manifest (v3)
- `dist/` - Built extension (load this in Chrome)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/scrape` | POST | Scrape recipe from URL |

## Key Dependencies

**Backend:**
- `fastapi>=0.115.0` with `uvicorn[standard]`
- `recipe-scrapers>=15.0.0`
- `httpx>=0.28.0`

**Extension:**
- Vue 3 with Vue Router
- IndexedDB for local storage

## Deployment (Synology NAS)

### Architecture
L'extension Chrome communique avec le backend via HTTPS :
- Backend hébergé sur NAS Synology avec Docker
- Exposé via reverse proxy DSM avec certificat SSL
- Les utilisateurs n'installent que l'extension Chrome

### Déploiement Docker

1. **Copier le dossier `backend/` sur le NAS**
   Via File Station ou SCP vers `/volume1/docker/reciper/`

2. **Lancer via Container Manager**
   - Projet > Créer
   - Sélectionner le dossier avec docker-compose.yml
   - Démarrer

3. **Configurer le Reverse Proxy DSM**
   - Panneau de configuration > Portail de connexion > Avancé > Proxy inversé
   - Source : `https://api.votre-domaine.com` (port 443)
   - Destination : `http://localhost:8742`

### Variables d'environnement
| Variable | Défaut | Description |
|----------|--------|-------------|
| PORT | 8742 | Port interne du container |
| CORS_ORIGINS | * | Origines autorisées (recommandé: votre domaine) |

### Vérification
```bash
curl https://api.votre-domaine.com/api/health
# Réponse : {"status":"healthy"}
```
