# Dossier pour les images d'ingrédients

Format: PNG 64x64px (@2x pour Retina, affichées à 32x32px)
Nommage: {image_id_en_anglais}.png (ex: tomato.png, onion.png, flour.png)

## Statistiques du dictionnaire FR→EN actuel

- 467 entrées dans le dictionnaire
- 269 images PNG uniques à créer
- Couverture estimée: 85-95% des recettes françaises courantes

## Images prioritaires (commencer par ~30 les plus courantes)

### Légumes (15 images)
- tomato.png, onion.png, garlic.png, carrot.png, potato.png
- zucchini.png, eggplant.png, bell-pepper.png, cucumber.png, lettuce.png
- spinach.png, broccoli.png, cabbage.png, mushroom.png, asparagus.png

### Produits de base (10 images)
- flour.png, sugar.png, salt.png, pepper.png, butter.png
- egg.png, milk.png, cream.png, oil.png, olive-oil.png

### Viandes & Poissons (8 images)
- chicken.png, beef.png, pork.png, lamb.png
- salmon.png, tuna.png, shrimp.png, scallop.png

### Fruits (7 images)
- lemon.png, apple.png, banana.png, strawberry.png
- orange.png, pear.png, grape.png

### Herbes & Épices (5 images)
- basil.png, parsley.png, thyme.png, rosemary.png, curry.png

Total priorité 1: ~45 images

## Liste complète des 269 images à créer

Consultez backend/app/data/translations/fr_to_en.py pour voir toutes les
valeurs uniques du dictionnaire (ce sont les noms de fichiers en anglais).

Pour obtenir la liste:
```python
from app.data.translations.fr_to_en import FR_TO_EN
unique_images = sorted(set(FR_TO_EN.values()))
print('\n'.join(f"{img}.png" for img in unique_images))
```

## Workflow de création

1. Créer les illustrations en PNG 64x64px
2. Nommer en anglais (résultat de FR_TO_EN)
3. Placer dans ce dossier
4. Le backend sert automatiquement via /api/ingredients/images/{image_id}
5. Cache navigateur (1 an) pour performances optimales

## Fallback

Si l'image n'existe pas:
- Le backend retourne 404
- Le frontend affiche un div gris (placeholder 40x40px)
- Aucune erreur, dégradation gracieuse

Vous pouvez donc créer les images progressivement !
