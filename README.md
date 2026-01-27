# RecettesScrapper

Application web locale pour sauvegarder et organiser des recettes de cuisine via scraping d'URLs.

## Fonctionnalites

- Ajouter une recette en collant son URL
- Afficher la liste des recettes sauvegardees
- Voir le detail d'une recette (ingredients, instructions, temps)
- Supprimer une recette
- **Extension Chrome** : Sauvegarde automatique des recettes en cliquant sur les liens

## Stack technique

- **Backend**: Python 3.11+ / FastAPI / SQLAlchemy / SQLite
- **Scraping**: [recipe-scrapers](https://github.com/hhursev/recipe-scrapers) (606 sites supportes)
- **Frontend**: Vue.js 3 / Vite
- **Extension**: Chrome Extension (Manifest V3)

## Installation

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Lancement

### Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

L'API sera disponible sur http://localhost:8080

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

L'application sera disponible sur http://localhost:5173

## Extension Chrome

L'extension intercepte automatiquement les clics sur les liens de recettes depuis Google (ou autre) et les sauvegarde dans l'app locale.

### Installation

1. Ouvrir `chrome://extensions/`
2. Activer le **Mode developpeur**
3. Cliquer sur **Charger l'extension non empaquetee**
4. Selectionner le dossier `extension/`

### Utilisation

1. Lancer le backend et le frontend
2. Chercher une recette sur Google (ex: "gateau chocolat marmiton")
3. Cliquer sur le lien - la recette s'ouvre directement dans l'app locale

**Fallback** : Si le backend n'est pas lance, le site original s'ouvre normalement.

## Tests

```bash
cd backend
source venv/bin/activate
pytest
```

## Sites supportes

L'application supporte plus de 600 sites de recettes grace a la bibliotheque recipe-scrapers, dont :

- Marmiton
- 750g
- Cuisine AZ
- AllRecipes
- BBC Good Food
- Et bien d'autres...

## API Endpoints

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/recipes` | Ajouter une recette (body: `{"url": "..."}`) |
| GET | `/api/recipes` | Liste toutes les recettes |
| GET | `/api/recipes/{id}` | Detail d'une recette |
| DELETE | `/api/recipes/{id}` | Supprimer une recette |
# Recipper
