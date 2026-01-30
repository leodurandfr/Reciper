"""
Multilingual ingredient mapping dictionary.

Maps ingredient keywords across 5 languages (FR, EN, DE, ES, IT) to unique ingredient IDs.
Each ingredient has a category for fallback matching.
"""

# Dictionnaire de mapping : ingrédient → mots-clés multilingues
INGREDIENT_DATABASE = {
    'flour': {
        'category': 'starch',
        'keywords': {
            'fr': ['farine', 'fécule', 'maïzena'],
            'en': ['flour', 'starch', 'cornstarch', 'cornflour'],
            'de': ['mehl', 'stärke', 'maisstärke'],
            'es': ['harina', 'almidón', 'maicena'],
            'it': ['farina', 'amido', 'maizena']
        }
    },
    'tomato': {
        'category': 'vegetable',
        'keywords': {
            'fr': ['tomate'],
            'en': ['tomato'],
            'de': ['tomate'],
            'es': ['tomate', 'jitomate'],
            'it': ['pomodoro']
        }
    },
    'onion': {
        'category': 'vegetable',
        'keywords': {
            'fr': ['oignon'],
            'en': ['onion'],
            'de': ['zwiebel'],
            'es': ['cebolla'],
            'it': ['cipolla']
        }
    },
    'garlic': {
        'category': 'vegetable',
        'keywords': {
            'fr': ['ail', 'gousse'],
            'en': ['garlic', 'clove'],
            'de': ['knoblauch', 'zehe'],
            'es': ['ajo', 'diente'],
            'it': ['aglio', 'spicchio']
        }
    },
    'potato': {
        'category': 'vegetable',
        'keywords': {
            'fr': ['pomme', 'patate'],
            'en': ['potato'],
            'de': ['kartoffel'],
            'es': ['patata', 'papa'],
            'it': ['patata']
        }
    },
    'carrot': {
        'category': 'vegetable',
        'keywords': {
            'fr': ['carotte'],
            'en': ['carrot'],
            'de': ['karotte', 'möhre'],
            'es': ['zanahoria'],
            'it': ['carota']
        }
    },
    'sugar': {
        'category': 'ingredient',
        'keywords': {
            'fr': ['sucre'],
            'en': ['sugar'],
            'de': ['zucker'],
            'es': ['azúcar'],
            'it': ['zucchero']
        }
    },
    'salt': {
        'category': 'spice',
        'keywords': {
            'fr': ['sel'],
            'en': ['salt'],
            'de': ['salz'],
            'es': ['sal'],
            'it': ['sale']
        }
    },
    'pepper': {
        'category': 'spice',
        'keywords': {
            'fr': ['poivre'],
            'en': ['pepper'],
            'de': ['pfeffer'],
            'es': ['pimienta'],
            'it': ['pepe']
        }
    },
    'egg': {
        'category': 'protein',
        'keywords': {
            'fr': ['oeuf', 'œuf'],
            'en': ['egg'],
            'de': ['ei', 'eier'],
            'es': ['huevo'],
            'it': ['uovo', 'uova']
        }
    },
    'milk': {
        'category': 'dairy',
        'keywords': {
            'fr': ['lait'],
            'en': ['milk'],
            'de': ['milch'],
            'es': ['leche'],
            'it': ['latte']
        }
    },
    'butter': {
        'category': 'dairy',
        'keywords': {
            'fr': ['beurre'],
            'en': ['butter'],
            'de': ['butter'],
            'es': ['mantequilla'],
            'it': ['burro']
        }
    },
    'oil': {
        'category': 'liquid',
        'keywords': {
            'fr': ['huile'],
            'en': ['oil'],
            'de': ['öl'],
            'es': ['aceite'],
            'it': ['olio']
        }
    },
    'chicken': {
        'category': 'protein',
        'keywords': {
            'fr': ['poulet', 'volaille'],
            'en': ['chicken', 'poultry'],
            'de': ['hähnchen', 'huhn', 'geflügel'],
            'es': ['pollo'],
            'it': ['pollo']
        }
    },
    'beef': {
        'category': 'protein',
        'keywords': {
            'fr': ['boeuf', 'bœuf', 'viande'],
            'en': ['beef', 'meat'],
            'de': ['rindfleisch', 'fleisch'],
            'es': ['carne', 'res'],
            'it': ['manzo', 'carne']
        }
    },
}

# Catégories de fallback si ingrédient spécifique non trouvé
CATEGORY_IMAGES = {
    'vegetable': 'category-vegetable',
    'fruit': 'category-fruit',
    'starch': 'category-starch',
    'protein': 'category-protein',
    'dairy': 'category-dairy',
    'spice': 'category-spice',
    'liquid': 'category-liquid',
    'ingredient': 'category-ingredient',
}
