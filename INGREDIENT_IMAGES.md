# Guide d'utilisation : Images d'ingrédients

Ce guide explique comment utiliser et étendre le système d'images d'ingrédients avec dictionnaires modulaires par langue.

## 📋 Vue d'ensemble

Le système associe automatiquement des images aux ingrédients scrapés, avec support multilingue via dictionnaires modulaires.

### Architecture v2 (Dictionnaires modulaires)

```
Backend scrape recette (français)
    ↓
Extrait ingrédients bruts: ["200g de farine", "2 tomates", ...]
    ↓
Dictionnaire FR→EN traduit: "farine" → "flour", "tomates" → "tomato"
    ↓
Retourne enriched_ingredients avec image_id en anglais
    ↓
Extension affiche l'image via: /api/ingredients/images/{image_id}
    ↓
Exemple: GET /api/ingredients/images/flour → flour.png
```

**Langues actuellement supportées** :
- ✅ Français → Anglais (467 entrées, 269 images uniques)
- 🔜 Allemand → Anglais (futur)
- 🔜 Espagnol → Anglais (futur)
- 🔜 Italien → Anglais (futur)

## 🎨 Ajouter de nouvelles images

### Étape 1 : Créer l'illustration

- **Format** : PNG
- **Dimensions** : 64x64 pixels (@2x pour Retina)
- **Nom** : `{image_id}.png` (ex: `flour.png`, `tomato.png`)

### Étape 2 : Placer l'image

Copiez le fichier PNG dans :
```
backend/static/ingredients/{image_id}.png
```

### Étape 3 : Ajouter au dictionnaire

Éditez `backend/app/data/ingredient_mapping.py` :

```python
INGREDIENT_DATABASE = {
    # Exemple : ajouter "courgette"
    'zucchini': {
        'category': 'vegetable',
        'keywords': {
            'fr': ['courgette'],
            'en': ['zucchini', 'courgette'],
            'de': ['zucchini'],
            'es': ['calabacín'],
            'it': ['zucchina', 'zucchine']
        }
    },
    # ... autres ingrédients
}
```

### Étape 4 : Tester

```bash
# Redémarrer le backend (en mode --reload il se recharge automatiquement)
# Scraper une recette contenant cet ingrédient
# Vérifier que l'image s'affiche
```

## 📚 Ingrédients actuellement disponibles (MVP)

| Image ID | Catégorie | Exemples FR | Exemples EN | Exemples DE |
|----------|-----------|-------------|-------------|-------------|
| `flour` | starch | farine, fécule | flour, starch | mehl, stärke |
| `tomato` | vegetable | tomate | tomato | tomate |
| `onion` | vegetable | oignon | onion | zwiebel |
| `garlic` | vegetable | ail, gousse | garlic, clove | knoblauch |
| `potato` | vegetable | pomme, patate | potato | kartoffel |
| `carrot` | vegetable | carotte | carrot | karotte |
| `sugar` | ingredient | sucre | sugar | zucker |
| `salt` | spice | sel | salt | salz |
| `pepper` | spice | poivre | pepper | pfeffer |
| `egg` | protein | œuf, oeuf | egg | ei |
| `milk` | dairy | lait | milk | milch |
| `butter` | dairy | beurre | butter | butter |
| `oil` | liquid | huile | oil | öl |
| `chicken` | protein | poulet, volaille | chicken | hähnchen |
| `beef` | protein | bœuf, viande | beef, meat | rindfleisch |

## 🧪 Tests

### Tester le matching en Python

```bash
cd backend
source venv/bin/activate
python3 << 'EOF'
from app.ingredient_image_matcher import get_ingredient_image_id

tests = ["200g de farine", "2 tomatoes", "1 Zwiebel"]
for test in tests:
    print(f"{test} → {get_ingredient_image_id(test)}")
EOF
```

### Tester l'API

```bash
# 1. Scraper une recette
curl -X POST http://localhost:8742/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.marmiton.org/recettes/recette_pate-a-crepes_12372.aspx"}' \
  | python3 -m json.tool | grep -A 3 enriched_ingredients

# 2. Récupérer une image (une fois qu'elle existe)
curl http://localhost:8742/api/ingredients/images/flour --output /tmp/flour.png
open /tmp/flour.png
```

## 🔄 Démarrage du backend

### En développement (Mac)

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8742
```

Le backend sera accessible à `http://localhost:8742`

### En production (Docker)

Le dossier `static/ingredients/` sera automatiquement inclus dans l'image Docker.

```bash
cd backend
docker-compose up -d --build
```

Les images seront servies via HTTPS : `https://api.votre-domaine.com/api/ingredients/images/{image_id}`

## 📝 Bonnes pratiques

### Nommage des image_id

- Utiliser l'anglais pour l'ID (convention internationale)
- Utiliser le singulier : `tomato` (pas `tomatoes`)
- Minuscules uniquement : `onion` (pas `Onion`)
- Pas d'espaces : `bell-pepper` ou `bell_pepper`

### Mots-clés multilingues

- Inclure les formes courantes (avec/sans accent : `oeuf`, `œuf`)
- Penser aux pluriels irréguliers
- Ajouter les synonymes régionaux (ex: `patate` ET `pomme` pour potato en FR)

### Gestion des variations

Le matcher gère automatiquement :
- ✅ Pluriels en -s : `tomates` → `tomate`
- ✅ Pluriels en -es : `tomatoes` → `tomato`
- ✅ Casse : `Farine` → `farine`
- ✅ Stopwords : "de", "le", "la", articles

Pas encore géré (améliorations futures) :
- ❌ Stemming avancé : "farine complète" ne matche pas automatiquement
- ❌ Variations orthographiques : "boeuf" vs "bœuf" (ajouter les deux au dictionnaire)

## 🚀 Extensions futures

### Phase 2 : Plus d'ingrédients

Étendre à ~50-100 ingrédients courants :
- Légumes : courgette, poivron, aubergine, épinard...
- Fruits : pomme, banane, citron, orange...
- Féculents : riz, pâtes, pain, quinoa...
- Protéines : poisson, porc, tofu...
- Herbes : basilic, persil, thym, romarin...

### Phase 3 : Catégories de fallback

Afficher une icône générique quand l'ingrédient spécifique n'est pas trouvé :
- `category-vegetable.png`
- `category-fruit.png`
- `category-protein.png`
- etc.

### Phase 4 : Interface d'administration

Page web pour gérer le dictionnaire sans éditer le code :
- Ajouter/modifier des ingrédients
- Upload d'images
- Gestion des traductions

## 🐛 Dépannage

### L'image ne s'affiche pas dans l'extension

1. Vérifier que le fichier PNG existe : `ls backend/static/ingredients/`
2. Tester l'endpoint directement : `curl http://localhost:8742/api/ingredients/images/{image_id}`
3. Vérifier la console du navigateur (F12) pour les erreurs CORS
4. Vérifier que l'URL du backend est correcte dans les settings de l'extension

### Le matching ne fonctionne pas

1. Vérifier que le mot-clé est dans le dictionnaire :
   ```python
   from app.data.ingredient_mapping import INGREDIENT_DATABASE
   print(INGREDIENT_DATABASE['flour']['keywords'])
   ```

2. Tester manuellement :
   ```python
   from app.ingredient_image_matcher import get_ingredient_image_id
   print(get_ingredient_image_id("votre ingrédient ici"))
   ```

3. Ajouter des logs pour debugger :
   ```python
   # Dans ingredient_image_matcher.py
   keywords = extract_keywords(ingredient)
   print(f"Keywords extracted: {keywords}")
   ```

### Le backend ne démarre pas

1. Vérifier que le venv est activé : `source venv/bin/activate`
2. Vérifier que les dépendances sont installées : `pip list | grep fastapi`
3. Vérifier les logs : `cat /tmp/reciper-backend.log`
4. Tester le health check : `curl http://localhost:8742/api/health`

## 📞 Contact / Support

Pour toute question sur l'implémentation :
- Consulter le plan détaillé : `.claude/plans/proud-swimming-newell.md`
- Vérifier les tests : `backend/tests/`
- Examiner le code source des composants critiques listés ci-dessus
