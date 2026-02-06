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
    'bacon': 'bacon',
    'pancetta': 'bacon',
    'sausage': 'sausage',
    'chorizo': 'sausage',
    'salami': 'sausage',

    # ============================================================
    # FISH → fish
    # ============================================================
    'fish': 'fish',
    'salmon': 'fish',
    'tuna': 'fish',
    'cod': 'fish',
    'haddock': 'fish',
    'halibut': 'fish',
    'trout': 'fish',
    'mackerel': 'fish',
    'sardine': 'fish',
    'sardines': 'fish',
    'anchovy': 'fish',
    'anchovies': 'fish',
    'sole': 'fish',
    'bass': 'fish',
    'tilapia': 'fish',

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
    'oyster': 'mussel',
    'oysters': 'mussel',
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

    # === GRUYERE (distinct - common in recipes) ===
    'gruyere': 'gruyere',
    'gruyère': 'gruyere',

    # === CHEESE → cheese ===
    'cheese': 'cheese',
    'parmesan': 'cheese',
    'mozzarella': 'cheese',
    'cheddar': 'cheese',
    'brie': 'cheese',
    'camembert': 'cheese',
    'feta': 'cheese',
    'gouda': 'cheese',
    'gorgonzola': 'cheese',
    'goat': 'cheese',
    'pecorino': 'cheese',
    'roquefort': 'cheese',
    'swiss': 'cheese',
    'provolone': 'cheese',
    'manchego': 'cheese',
    'halloumi': 'cheese',

    # ============================================================
    # PASTA → pasta
    # ============================================================
    'pasta': 'pasta',
    'spaghetti': 'pasta',
    'tagliatelle': 'pasta',
    'fettuccine': 'pasta',
    'linguine': 'pasta',
    'penne': 'pasta',
    'rigatoni': 'pasta',
    'fusilli': 'pasta',
    'farfalle': 'pasta',
    'macaroni': 'pasta',
    'lasagna': 'pasta',
    'lasagne': 'pasta',
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

    # ============================================================
    # FLOUR & LEAVENING
    # ============================================================
    'flour': 'flour',
    'cornstarch': 'cornstarch',
    'starch': 'starch',
    'yeast': 'yeast',
    'baking': 'baking-soda',

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

    # ============================================================
    # NUTS → nuts
    # ============================================================
    'almond': 'nuts',
    'almonds': 'nuts',
    'walnut': 'nuts',
    'walnuts': 'nuts',
    'peanut': 'nuts',
    'peanuts': 'nuts',
    'cashew': 'nuts',
    'cashews': 'nuts',
    'pistachio': 'nuts',
    'pistachios': 'nuts',
    'pecan': 'nuts',
    'pecans': 'nuts',
    'hazelnut': 'nuts',
    'hazelnuts': 'nuts',
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
    'basil': 'herbs',
    'parsley': 'herbs',
    'cilantro': 'herbs',
    'coriander': 'herbs',
    'thyme': 'herbs',
    'rosemary': 'herbs',
    'oregano': 'herbs',
    'mint': 'herbs',
    'sage': 'herbs',
    'dill': 'herbs',
    'chive': 'herbs',
    'chives': 'herbs',
    'bay': 'herbs',
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
    'soy': 'soy-sauce',
    'worcestershire': 'worcestershire-sauce',
    'tabasco': 'tabasco',
    'wine': 'wine',
    'stock': 'broth',
    'broth': 'broth',
    'pesto': 'pesto',
    'harissa': 'harissa',
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
}
