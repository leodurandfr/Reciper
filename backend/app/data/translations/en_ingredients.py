"""
English ingredient to image ID mapping.

For English ingredients, we map common ingredient names and their variations
directly to image IDs.

REGROUPEMENT STRATEGY (same as French):
- Similar ingredients are grouped under a single image ID
- Example: tagliatelle, farfalle, fusilli → 'pasta'
- Example: salmon, tuna, cod → 'fish'
"""

EN_INGREDIENTS = {
    # ============================================================
    # VEGETABLES
    # ============================================================
    'tomato': 'tomato',
    'tomatoes': 'tomato',
    'onion': 'onion',
    'onions': 'onion',
    'garlic': 'garlic',
    'potato': 'potato',
    'potatoes': 'potato',
    'carrot': 'carrot',
    'carrots': 'carrot',
    'bell': 'bell-pepper',
    'pepper': 'bell-pepper',
    'peppers': 'bell-pepper',
    'celery': 'celery',
    'cucumber': 'cucumber',
    'zucchini': 'zucchini',
    'courgette': 'zucchini',
    'eggplant': 'eggplant',
    'aubergine': 'eggplant',
    'broccoli': 'broccoli',
    'cauliflower': 'cauliflower',
    'spinach': 'spinach',
    'mushroom': 'mushroom',
    'mushrooms': 'mushroom',
    'shiitake': 'mushroom',
    'portobello': 'mushroom',
    'corn': 'corn',
    'pea': 'pea',
    'peas': 'pea',
    'bean': 'green-bean',
    'beans': 'green-bean',
    'kidney': 'kidney-bean',
    'chickpea': 'chickpea',
    'chickpeas': 'chickpea',
    'lentil': 'lentil',
    'lentils': 'lentil',
    'leek': 'leek',
    'leeks': 'leek',
    'shallot': 'shallot',
    'shallots': 'shallot',
    'turnip': 'turnip',
    'beet': 'beet',
    'beetroot': 'beet',
    'squash': 'squash',
    'pumpkin': 'pumpkin',
    'asparagus': 'asparagus',
    'artichoke': 'artichoke',
    'endive': 'endive',
    'chard': 'chard',
    'avocado': 'avocado',
    'avocados': 'avocado',
    'chili': 'chili',
    'ginger': 'ginger',
    'olive': 'olive',
    'olives': 'olive',
    'cabbage': 'cabbage',
    'fennel': 'fennel',
    'radish': 'radish',

    # === SALADS → lettuce ===
    'lettuce': 'lettuce',
    'salad': 'lettuce',
    'arugula': 'lettuce',
    'rocket': 'lettuce',
    'mesclun': 'lettuce',
    'iceberg': 'lettuce',
    'romaine': 'lettuce',
    'kale': 'lettuce',

    # ============================================================
    # FRUITS
    # ============================================================
    'apple': 'apple',
    'apples': 'apple',
    'pear': 'pear',
    'pears': 'pear',
    'banana': 'banana',
    'bananas': 'banana',
    'kiwi': 'kiwi',
    'mango': 'mango',
    'mangoes': 'mango',
    'pineapple': 'pineapple',
    'papaya': 'papaya',
    'fig': 'fig',
    'figs': 'fig',
    'date': 'date',
    'dates': 'date',
    'apricot': 'apricot',
    'apricots': 'apricot',
    'peach': 'peach',
    'peaches': 'peach',
    'nectarine': 'nectarine',
    'plum': 'plum',
    'plums': 'plum',
    'rhubarb': 'rhubarb',
    'lychee': 'lychee',
    'melon': 'melon',
    'watermelon': 'watermelon',
    'coconut': 'coconut',
    'pomegranate': 'pomegranate',

    # === LEMON (distinct) ===
    'lemon': 'lemon',
    'lemons': 'lemon',
    'lime': 'lemon',
    'limes': 'lemon',

    # === CITRUS → orange (except lemon) ===
    'orange': 'orange',
    'oranges': 'orange',
    'grapefruit': 'orange',
    'mandarin': 'orange',
    'tangerine': 'orange',
    'clementine': 'orange',

    # === BERRIES ===
    'strawberry': 'strawberry',
    'strawberries': 'strawberry',
    'blueberry': 'blueberry',
    'blueberries': 'blueberry',
    'raspberry': 'raspberry',
    'raspberries': 'raspberry',
    'blackberry': 'blackberry',
    'blackberries': 'blackberry',
    'cherry': 'cherry',
    'cherries': 'cherry',
    'grape': 'grape',
    'grapes': 'grape',
    'cranberry': 'redcurrant',
    'currant': 'redcurrant',

    # ============================================================
    # POULTRY → chicken
    # ============================================================
    'chicken': 'chicken',
    'turkey': 'chicken',
    'poultry': 'chicken',
    'hen': 'chicken',
    'quail': 'chicken',

    # ============================================================
    # RED MEAT → beef
    # ============================================================
    'beef': 'beef',
    'steak': 'beef',
    'veal': 'beef',
    'lamb': 'beef',
    'mutton': 'beef',
    'roast': 'beef',

    # ============================================================
    # PORK (distinct)
    # ============================================================
    'pork': 'pork',
    'tenderloin': 'pork',

    # ============================================================
    # DUCK (distinct)
    # ============================================================
    'duck': 'duck',

    # ============================================================
    # CURED MEATS → ham
    # ============================================================
    'ham': 'ham',
    'prosciutto': 'ham',
    'coppa': 'ham',
    'bresaola': 'ham',
    'mortadella': 'ham',
    'bacon': 'bacon',
    'pancetta': 'bacon',
    'sausage': 'sausage',
    'chorizo': 'sausage',
    'salami': 'sausage',
    'pepperoni': 'sausage',

    # ============================================================
    # FISH
    # ============================================================
    'fish': 'fish',

    # Salmon (distinct)
    'salmon': 'salmon',

    # Tuna (distinct)
    'tuna': 'tuna',

    # White fish → white-fish
    'cod': 'white-fish',
    'haddock': 'white-fish',
    'halibut': 'white-fish',
    'sole': 'white-fish',
    'bass': 'white-fish',
    'tilapia': 'white-fish',

    # Rest → fish (generic)
    'trout': 'fish',
    'mackerel': 'fish',
    'sardine': 'fish',
    'sardines': 'fish',
    'anchovy': 'fish',
    'anchovies': 'fish',

    # ============================================================
    # SHELLFISH → shrimp
    # ============================================================
    'shrimp': 'shrimp',
    'prawn': 'shrimp',
    'prawns': 'shrimp',
    'lobster': 'shrimp',
    'crab': 'shrimp',
    'crayfish': 'shrimp',
    'langoustine': 'shrimp',

    # ============================================================
    # MOLLUSKS → mussel
    # ============================================================
    'mussel': 'mussel',
    'mussels': 'mussel',
    'oyster': 'oyster',
    'oysters': 'oyster',
    'clam': 'mussel',
    'clams': 'mussel',
    'scallop': 'mussel',
    'scallops': 'mussel',
    'squid': 'mussel',
    'calamari': 'mussel',
    'octopus': 'mussel',
    'cuttlefish': 'mussel',

    # ============================================================
    # DAIRY
    # ============================================================
    'milk': 'milk',
    'butter': 'butter',
    'yogurt': 'yogurt',
    'yoghurt': 'yogurt',
    'egg': 'egg',
    'eggs': 'egg',

    # === CREAM (+ creamy cheeses) → cream ===
    'cream': 'cream',
    'ricotta': 'cream',
    'mascarpone': 'cream',
    'cottage': 'cream',

    # === SOFT CHEESE (white rind) → camembert ===
    'camembert': 'camembert',

    # === BRIE (distinct) ===
    'brie': 'brie',

    # === GOAT CHEESE → goat-cheese ===
    'goat': 'goat-cheese',

    # === BLUE CHEESE → blue-cheese ===
    'roquefort': 'blue-cheese',
    'gorgonzola': 'blue-cheese',

    # === PARMESAN (distinct) ===
    'parmesan': 'parmesan',
    'parmigiano': 'parmesan',

    # === CHEESE (hard / generic) → cheese ===
    'gruyere': 'cheese',
    'gruyère': 'cheese',
    'cheese': 'cheese',
    'mozzarella': 'cheese',
    'cheddar': 'cheese',
    'feta': 'cheese',
    'gouda': 'cheese',
    'pecorino': 'cheese',
    'swiss': 'cheese',
    'provolone': 'cheese',
    'manchego': 'cheese',
    'halloumi': 'cheese',

    # ============================================================
    # PASTA → pasta
    # ============================================================
    'pasta': 'pasta',

    # Specific pasta types
    'spaghetti': 'spaghetti',
    'tagliatelle': 'tagliatelle',
    'fettuccine': 'tagliatelle',
    'farfalle': 'farfalle',
    'fusilli': 'fusilli',
    'penne': 'penne',
    'macaroni': 'macaroni',
    'lasagna': 'lasagna',
    'lasagne': 'lasagna',

    # Rest → pasta (generic)
    'linguine': 'pasta',
    'rigatoni': 'pasta',
    'ravioli': 'pasta',
    'tortellini': 'pasta',
    'gnocchi': 'pasta',
    'orzo': 'pasta',
    'noodle': 'pasta',
    'noodles': 'pasta',
    'vermicelli': 'pasta',
    'cannelloni': 'pasta',
    'orecchiette': 'pasta',
    'papardelle': 'pasta',
    'bucatini': 'pasta',

    # ============================================================
    # GRAINS & STARCHES
    # ============================================================
    'rice': 'rice',
    'basmati': 'rice',
    'arborio': 'rice',
    'jasmine': 'rice',
    'quinoa': 'quinoa',
    'bulgur': 'bulgur',
    'couscous': 'couscous',
    'oat': 'oat',
    'oats': 'oat',
    'oatmeal': 'oat',
    'bread': 'bread',
    'breadcrumb': 'breadcrumb',
    'breadcrumbs': 'breadcrumb',
    'cracker': 'cracker',
    'crackers': 'cracker',
    'biscuit': 'cracker',
    'biscuits': 'cracker',
    'cookie': 'cracker',
    'cookies': 'cracker',
    'speculoos': 'speculos',

    # ============================================================
    # FLOUR & LEAVENING
    # ============================================================
    'flour': 'flour',
    'cornstarch': 'cornstarch',
    'starch': 'white-powder',
    'yeast': 'yeast',
    'baking': 'white-powder',

    # ============================================================
    # SWEETENERS
    # ============================================================
    'sugar': 'sugar',
    'honey': 'honey',
    'syrup': 'syrup',
    'maple': 'maple-syrup',
    'molasses': 'brown-sugar',
    'jam': 'jam',
    'jelly': 'jam',
    'chocolate': 'chocolate',
    'cocoa': 'cocoa',
    'nutella': 'spread',

    # ============================================================
    # NUTS
    # ============================================================

    # Almond (distinct)
    'almond': 'almond',
    'almonds': 'almond',

    # Hazelnut (distinct)
    'hazelnut': 'hazelnut',
    'hazelnuts': 'hazelnut',

    # Peanut (distinct)
    'peanut': 'peanut',
    'peanuts': 'peanut',

    # Rest → nuts (generic)
    'walnut': 'nuts',
    'walnuts': 'nuts',
    'cashew': 'nuts',
    'cashews': 'nuts',
    'pistachio': 'nuts',
    'pistachios': 'nuts',
    'pecan': 'nuts',
    'pecans': 'nuts',
    'macadamia': 'nuts',
    'pine': 'nuts',

    # Seeds (distinct)
    'sesame': 'sesame',
    'sunflower': 'sunflower-seed',
    'flax': 'flax-seed',
    'chia': 'chia-seed',
    'poppy': 'poppy-seed',

    # ============================================================
    # HERBS → herbs
    # ============================================================
    # Tier 1 — specific herbs
    'basil': 'basil',
    'parsley': 'parsley',
    'cilantro': 'cilantro',
    'coriander': 'cilantro',
    'mint': 'mint',
    'rosemary': 'rosemary',

    # Tier 2 — specific herbs
    'thyme': 'thyme',
    'chive': 'chives',
    'chives': 'chives',
    'dill': 'dill',
    'bay': 'bay',

    'oregano': 'oregano',

    # Rest → herbs (generic)
    'sage': 'herbs',
    'tarragon': 'herbs',
    'herb': 'herbs',
    'herbs': 'herbs',
    'marjoram': 'herbs',

    # ============================================================
    # SPICES
    # ============================================================
    'salt': 'salt',
    'cinnamon': 'cinnamon',
    'paprika': 'paprika',
    'cumin': 'cumin',
    'turmeric': 'turmeric',
    'nutmeg': 'nutmeg',
    'vanilla': 'vanilla',
    'clove': 'clove',
    'cloves': 'clove',
    'cardamom': 'cardamom',
    'saffron': 'saffron',
    'cayenne': 'cayenne',
    'curry': 'curry',

    # ============================================================
    # OILS → oil
    # ============================================================
    'oil': 'oil',
    'vegetable': 'oil',
    'canola': 'oil',
    'sunflower': 'oil',

    # ============================================================
    # CONDIMENTS & SAUCES
    # ============================================================
    'vinegar': 'vinegar',
    'mustard': 'mustard',
    'ketchup': 'ketchup',
    'mayonnaise': 'mayonnaise',
    'mayo': 'mayonnaise',
    'soy': 'sauce',
    'worcestershire': 'worcestershire-sauce',
    'tabasco': 'tabasco',
    'wine': 'wine',
    'stock': 'broth',
    'broth': 'broth',
    'pesto': 'pesto',
    'pesto-rosso': 'pesto-rosso',
    'harissa': 'harissa',
    'fish-sauce': 'sauce',
    'tahini': 'tahini',
    'miso': 'miso',
    'pickle': 'pickle',
    'pickles': 'pickle',
    'caper': 'caper',
    'capers': 'caper',

    # ============================================================
    # BEVERAGES
    # ============================================================
    'coffee': 'coffee',
    'tea': 'tea',

    # ============================================================
    # OTHER
    # ============================================================
    'tofu': 'tofu',
    'tempeh': 'tofu',
    'seitan': 'tofu',
    'water': 'water',
    'pate': 'pate',
    'terrine': 'pate',
}
