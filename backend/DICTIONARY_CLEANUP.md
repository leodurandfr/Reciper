# Nettoyage du dictionnaire FR_TO_EN

## Date : 2026-02-02

## Objectif

Supprimer les entrées ambiguës du dictionnaire qui causaient des faux positifs dans le matching d'ingrédients.

## Contexte

Le système utilise une règle "last match" qui prend le DERNIER mot correspondant trouvé dans l'ingrédient. Cette règle fonctionne bien pour le français où l'ingrédient principal est généralement à la fin (ex: "filets de poisson **blanc**" → devrait matcher "blanc" si c'est l'ingrédient principal).

Cependant, des entrées trop génériques dans le dictionnaire causaient des problèmes :
- **Modifiers (adjectifs)** : "rouge", "blanc", "vert" → couleurs, pas ingrédients
- **Coupes** : "filet", "cuisse" → parties de viande, pas l'ingrédient de base
- **Préparations** : "fumé", "haché" → méthodes de cuisson, pas ingrédients

## Principe de nettoyage

**Garder UNIQUEMENT les noms d'ingrédients finaux**, pas les modifiers/coupes/préparations.

### Exemples de ce qu'on GARDE :
✅ `'tomate': 'tomato'` - Ingrédient réel
✅ `'cabillaud': 'cod'` - Ingrédient spécifique
✅ `'farine': 'flour'` - Produit de base

### Exemples de ce qu'on SUPPRIME :
❌ `'rouge': 'kidney-bean'` - Couleur, trop générique
❌ `'filet': 'tenderloin'` - Coupe de viande
❌ `'fumé': 'smoked-salmon'` - Méthode de préparation

## Entrées supprimées

### Modifiers (couleurs, qualificatifs)

#### ❌ `'rouge': 'kidney-bean'` et `'rouges': 'kidney-bean'`

**Pourquoi ?**
- Trop générique : "rouge" est une COULEUR, pas un ingrédient
- Causait des faux positifs :
  - "tomate rouge" → matchait "kidney-bean" au lieu de "tomato"
  - "oignon rouge" → matchait "kidney-bean" au lieu de "onion"
  - "vin rouge" → matchait "kidney-bean" au lieu de "wine"

**Solution :**
- Supprimé du dictionnaire
- Ajouté pattern de composé `haricot.{0,10}rouge` → `kidney-bean`
- Maintenant "haricot rouge" match toujours correctement

## Impact

### Statistiques
- **Avant** : 394 entrées → 229 ingrédients uniques
- **Après** : 392 entrées → 228 ingrédients uniques
- **Suppression** : 2 entrées ambiguës (`rouge`, `rouges`)

### Tests

#### ✅ Tests passés après nettoyage :

**Ambiguous Modifiers Removed:**
- `rouge` seul → `None` (plus de match)
- `tomate rouge` → `tomato` ✓ (avant: `kidney-bean` ❌)
- `oignon rouge` → `onion` ✓ (avant: `kidney-bean` ❌)
- `vin rouge` → `wine` ✓ (avant: `kidney-bean` ❌)
- `haricot rouge` → `kidney-bean` ✓ (via compound pattern)

**Real-World Recipe Cases:**
- `4 filets de Poisson blanc charnus (dos de cabillaud)` → `cod` ✓
- `2½ pots de yaourt vides de farine` → `flour` ✓
- `200g de saumon fumé` → `salmon` ✓

## Tests de validation

Deux suites de tests :

### 1. `test_dictionary_cleanup.py` (nouveau)
Tests spécifiques pour vérifier que les entrées ambiguës ne causent plus de faux positifs.

```bash
cd backend
python3 test_dictionary_cleanup.py
```

### 2. `test_ingredient_enrichment.py` (existant)
Tests de régression complets pour vérifier qu'aucune fonctionnalité n'est cassée.

```bash
cd backend
python3 test_ingredient_enrichment.py
```

## Philosophie pour l'avenir

### Critères pour AJOUTER une entrée au dictionnaire :

1. ✅ **C'est un nom d'ingrédient final** (tomate, poulet, farine)
2. ✅ **C'est un produit spécifique** (parmesan, basilic, saumon)
3. ✅ **C'est non-ambigu** (utilisé seul, pas de conflit)

### Critères pour REFUSER une entrée :

1. ❌ **C'est un modifier** (rouge, blanc, grand, petit)
2. ❌ **C'est une coupe** (filet, cuisse, tranche)
3. ❌ **C'est une préparation** (fumé, haché, séché)
4. ❌ **C'est trop court et ambigu** (de, à, le, la)
5. ❌ **C'est une quantité** (entier, demi, pincée)

### Alternative : Compound Patterns

Pour les expressions multi-mots spécifiques, utiliser les **compound patterns** dans `ingredient_image_matcher.py` :

```python
compound_patterns = [
    (r'huile.{0,10}olive', 'olive-oil'),       # "huile d'olive"
    (r'haricot.{0,10}rouge', 'kidney-bean'),   # "haricot rouge"
    (r'citron.{0,10}vert', 'lime'),            # "citron vert"
]
```

## Audit du dictionnaire

Script d'audit disponible : `backend/audit_dictionary.py`

```bash
cd backend
python3 audit_dictionary.py
```

Identifie automatiquement :
- Mots courts (< 4 caractères)
- Adjectifs courants (couleurs, qualificatifs)
- Coupes de viande/poisson
- Méthodes de préparation
- Quantités

## Limitations actuelles et plan futur

### Limitations connues

#### 🔴 La règle "last match" est spécifique au français

**Exemple :**
- ✅ Français : "filets de poisson blanc" → DERNIER mot = "blanc" (OK si ingrédient)
- ❌ Anglais : "ground beef" → DERNIER = "beef" ✓ (par chance)
- ❌ Espagnol : "tomate roja picada" → DERNIER = "picada" ❌ (méthode, pas ingrédient)

**Pourquoi ça marche en français ?**
En français, la structure typique est :
```
[quantité] [préposition] [modifier] [INGRÉDIENT]
2 cuillères de      sucre     → "sucre" est dernier ✓
4 filets    de      poulet    → "poulet" est dernier ✓
```

**Pourquoi ça ne marchera pas en anglais ?**
En anglais, l'ordre est variable :
```
[modifier] [INGRÉDIENT] [préparation]
ground     beef                       → "beef" est dernier ✓ (chance)
chicken    breast    grilled          → "grilled" est dernier ❌
```

**Pourquoi ça ne marchera pas en espagnol ?**
En espagnol, les adjectifs sont APRÈS le nom :
```
[INGRÉDIENT] [modifier] [préparation]
tomate       roja      picada         → "picada" est dernier ❌
```

### Plan futur (si besoin multilingue)

#### Phase 2 : Architecture modulaire par langue

Si l'application doit supporter d'autres langues :

1. **Détection de langue** : détecter la langue de l'ingrédient (ou du site)
2. **Matchers spécialisés** : un matcher par langue avec ses propres règles
3. **Stratégies adaptées** :
   - Français : DERNIER match (last)
   - Anglais : Scoring pondéré (préférer mots longs)
   - Espagnol : PREMIER match (first)
   - Allemand : PREMIER match + longueur (composés)

**Structure proposée :**
```
backend/app/
├── ingredient_image_matcher.py      # Orchestrateur
├── language_detection.py            # Détection de langue
├── matchers/
│   ├── base.py                      # Classe abstraite
│   ├── french.py                    # Règles françaises
│   ├── english.py                   # Règles anglaises
│   └── spanish.py                   # Règles espagnoles
```

**Pour l'instant (2026-02-02) :**
- L'app scrape principalement des sites **français** (Marmiton, 750g)
- La règle "last match" fonctionne bien
- Pas besoin de sur-engineering

## Résumé

### ✅ Problème résolu
- Suppression de `'rouge'/'rouges'` du dictionnaire
- Ajout de compound pattern `haricot rouge`
- Tous les tests passent (0 régression)

### 📊 Impact
- "tomate rouge" → `tomato` ✓ (avant: `kidney-bean` ❌)
- "haricot rouge" → `kidney-bean` ✓ (toujours OK)

### 🚀 Pour l'avenir
- Le dictionnaire est maintenant plus propre
- Critères clairs pour ajouter/refuser des entrées
- Plan prêt pour architecture multilingue si nécessaire
