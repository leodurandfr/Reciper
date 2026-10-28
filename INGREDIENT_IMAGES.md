# Guide d'utilisation : Images d'ingrédients

Ce guide explique comment fonctionne et comment étendre le système d'images d'ingrédients, avec ses dictionnaires par langue.

## 📋 Vue d'ensemble

Le système associe automatiquement une illustration à chaque ingrédient scrapé. Tout se passe dans l'extension : le matching est fait en Python (Pyodide) au moment du scraping, et les images sont embarquées dans le build.

### Architecture

```
Scraping de la recette dans Pyodide (extension/python/reciper/scraper.py)
    ↓
Langue détectée d'après le site (language_detection.py)
    ↓
Ingrédients bruts : ["200g de farine", "2 tomates", ...]
    ↓
Dictionnaire de la langue : "farine" → "flour", "tomates" → "tomato"
    ↓
enriched_ingredients : [{ text, image_id }, ...] sauvegardé avec la recette
    ↓
L'app affiche src/assets/ingredients/{image_id}.png (RecipeIngredients.vue)
La page de partage charge la même image depuis le dépôt GitHub
```

**Langues actuellement supportées** :
- ✅ Français (`fr_to_en.py` + `fr_patterns.py`)
- ✅ Anglais (`en_ingredients.py` + `en_patterns.py`)
- Autres langues : pas d'image (`image_id` vaut `null`)

Fichiers concernés :
- `extension/python/reciper/ingredient_image_matcher.py` : logique de matching commune à toutes les langues
- `extension/python/reciper/data/translations/` : dictionnaires (mot → `image_id`) et motifs par langue
- `extension/src/assets/ingredients/` : les illustrations (`{image_id}.png`)

## 🎨 Ajouter de nouvelles images

### Étape 1 : Créer l'illustration

- **Format** : PNG transparent
- **Dimensions** : 300x300 pixels (affichée en 36x36)
- **Nom** : `{image_id}.png` (ex: `flour.png`, `tomato.png`)

### Étape 2 : Placer l'image

Copiez le fichier PNG dans :
```
extension/src/assets/ingredients/{image_id}.png
```

### Étape 3 : Ajouter aux dictionnaires

Dans `extension/python/reciper/data/translations/`, ajoutez les mots de chaque langue :

```python
# fr_to_en.py
FR_TO_EN = {
    'courgette': 'zucchini',
    'courgettes': 'zucchini',
    # ...
}

# en_ingredients.py
EN_INGREDIENTS = {
    'zucchini': 'zucchini',
    'zucchinis': 'zucchini',
    # ...
}
```

Les cas ambigus (« pâte feuilletée » ≠ « pâtes », « tomates cerise » ≠ « cerise ») se règlent dans `{langue}_patterns.py` (`COMPOUND_PATTERNS`, `EXCLUSION_PATTERNS` — un mot-clé ou un tuple de mots-clés à exclure —, et `UNIT_PATTERNS` pour les unités à retirer du texte avant le matching, ex. « c. à café »).

### Étape 4 : Tester

```bash
cd extension/python
python3 -c "
from reciper.ingredient_image_matcher import get_ingredient_image_id
for text in ['200g de farine', '1 pâte feuilletée']:
    print(text, '->', get_ingredient_image_id(text, 'fr'))
"
```

Puis `npm run build` dans `extension/`, recharger l'extension et scraper une recette contenant cet ingrédient. Les recettes déjà sauvegardées gardent leur `image_id` d'origine.

## 📝 Bonnes pratiques

### Nommage des image_id

- Utiliser l'anglais pour l'ID (convention internationale)
- Utiliser le singulier : `tomato` (pas `tomatoes`)
- Minuscules uniquement : `onion` (pas `Onion`)
- Mots séparés par des tirets : `bell-pepper` (la page de partage n'accepte que `[a-z0-9-]`)
- Ne pas renommer ni supprimer une image existante : les liens de partage déjà envoyés la chargent par son nom depuis la branche `main`

### Mots-clés multilingues

- Inclure les formes courantes (avec/sans accent : `oeuf`, `œuf`)
- Penser aux pluriels (le dictionnaire liste les formes explicitement)
- Ajouter les synonymes régionaux (ex: `patate` ET `pomme de terre` pour potato en FR)
- Regrouper les ingrédients proches sous une même image (ex: tagliatelle, farfalle → `pasta` si pas d'image dédiée)

### Gestion des variations

Le matcher gère automatiquement :
- ✅ Casse : `Farine` → `farine`
- ✅ Ponctuation et apostrophes : `Œuf(s)`, `d'ail`
- ✅ Unités et quantités (`UNIT_PATTERNS`)
- ✅ Plusieurs mots-clés : le dernier mot reconnu l'emporte (« huile d'olive » → `oil`)

## 🐛 Dépannage

### L'image ne s'affiche pas dans l'extension

1. Vérifier que le fichier PNG existe : `ls extension/src/assets/ingredients/`
2. Vérifier l'`image_id` renvoyé par le matcher (voir Étape 4)
3. Refaire `npm run build` : les images sont intégrées au build

### Le matching ne fonctionne pas

1. Vérifier que le mot-clé est dans le dictionnaire de la langue
2. Vérifier la langue détectée pour le site (`language_detection.py`)
3. Chercher un motif d'exclusion ou composé qui l'intercepte (`{langue}_patterns.py`)
