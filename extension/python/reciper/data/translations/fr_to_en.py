"""
French to English translation dictionary for ingredient matching.

All images are named in English (e.g., tomato.png, onion.png).
This dictionary maps French ingredient names to their English image IDs.

REGROUPEMENT STRATEGY:
- Similar ingredients are grouped under a single image ID
- Example: tagliatelle, farfalle, fusilli → 'pasta'
- Example: gruyère, emmental, comté → 'cheese'
"""

# Main translation dictionary FR → EN
FR_TO_EN = {
    # ============================================================
    # LÉGUMES
    # ============================================================
    'tomate': 'tomato',
    'tomates': 'tomato',
    'patate': 'potato',
    'patates': 'potato',
    'terre': 'potato',  # "pomme de terre"
    'carotte': 'carrot',
    'carottes': 'carrot',
    'oignon': 'onion',
    'oignons': 'onion',
    'ail': 'garlic',
    'échalote': 'shallot',
    'échalotes': 'shallot',
    'chalote': 'shallot',
    'chalotes': 'shallot',
    'poireau': 'leek',
    'poireaux': 'leek',
    'courgette': 'zucchini',
    'courgettes': 'zucchini',
    'aubergine': 'eggplant',
    'aubergines': 'eggplant',
    'poivron': 'bell-pepper',
    'poivrons': 'bell-pepper',
    'concombre': 'cucumber',
    'concombres': 'cucumber',
    'champignon': 'mushroom',
    'champignons': 'mushroom',
    'shiitake': 'mushroom',
    'cèpe': 'mushroom',
    'cèpes': 'mushroom',
    'girolle': 'mushroom',
    'girolles': 'mushroom',
    'pleurote': 'mushroom',
    'pleurotes': 'mushroom',
    'céleri': 'celery',
    'celeri': 'celery',
    'fenouil': 'fennel',
    'radis': 'radish',
    'navet': 'turnip',
    'navets': 'turnip',
    'betterave': 'beet',
    'betteraves': 'beet',
    'courge': 'squash',
    'butternut': 'squash',
    'potiron': 'pumpkin',
    'potirons': 'pumpkin',
    'citrouille': 'pumpkin',
    'citrouilles': 'pumpkin',
    'asperge': 'asparagus',
    'asperges': 'asparagus',
    'artichaut': 'artichoke',
    'artichauts': 'artichoke',
    'endive': 'endive',
    'endives': 'endive',
    'blette': 'chard',
    'blettes': 'chard',
    'avocat': 'avocado',
    'avocats': 'avocado',
    'piment': 'chili',
    'piments': 'chili',
    'chili': 'chili',
    'gingembre': 'ginger',
    'olive': 'olive',
    'olives': 'olive',
    'maïs': 'corn',
    'mais': 'corn',
    'brocoli': 'broccoli',
    'brocolis': 'broccoli',
    'chou-fleur': 'cauliflower',
    'choufleur': 'cauliflower',
    'chou': 'cabbage',
    'choux': 'cabbage',
    'bruxelles': 'brussels-sprout',
    'haricot': 'green-bean',
    'haricots': 'green-bean',
    'pois': 'pea',
    'edamame': 'edamame',

    # === SALADES → lettuce ===
    'salade': 'lettuce',
    'laitue': 'lettuce',
    'batavia': 'lettuce',
    'frisée': 'lettuce',
    'frisee': 'lettuce',
    'iceberg': 'lettuce',
    'mâche': 'lettuce',
    'mache': 'lettuce',
    'mesclun': 'lettuce',
    'roquette': 'lettuce',
    'épinard': 'spinach',
    'épinards': 'spinach',
    'epinard': 'spinach',
    'epinards': 'spinach',

    # ============================================================
    # FRUITS
    # ============================================================
    'pomme': 'apple',
    'pommes': 'apple',
    'poire': 'pear',
    'poires': 'pear',
    'banane': 'banana',
    'bananes': 'banana',
    'kiwi': 'kiwi',
    'kiwis': 'kiwi',
    'mangue': 'mango',
    'mangues': 'mango',
    'ananas': 'pineapple',
    'papaye': 'papaya',
    'papayes': 'papaya',
    'passion': 'passion-fruit',
    'grenade': 'pomegranate',
    'grenades': 'pomegranate',
    'figue': 'fig',
    'figues': 'fig',
    'datte': 'date',
    'dattes': 'date',
    'abricot': 'apricot',
    'abricots': 'apricot',
    'pêche': 'peach',
    'pêches': 'peach',
    'peche': 'peach',
    'peches': 'peach',
    'nectarine': 'nectarine',
    'nectarines': 'nectarine',
    'prune': 'plum',
    'prunes': 'plum',
    'rhubarbe': 'rhubarb',
    'litchi': 'lychee',
    'litchis': 'lychee',
    'melon': 'melon',
    'melons': 'melon',
    'pastèque': 'watermelon',
    'pastèques': 'watermelon',
    'pasteque': 'watermelon',
    'pasteques': 'watermelon',
    'coco': 'coconut',

    # === CITRON (distinct) ===
    'citron': 'lemon',
    'citrons': 'lemon',
    'lime': 'lemon',
    'limes': 'lemon',

    # === AGRUMES → orange (sauf citron) ===
    'orange': 'orange',
    'oranges': 'orange',
    'pamplemousse': 'orange',
    'pamplemousses': 'orange',
    'mandarine': 'orange',
    'mandarines': 'orange',
    'clémentine': 'orange',
    'clémentines': 'orange',
    'clementine': 'orange',
    'clementines': 'orange',

    # === BAIES → berry ===
    'fraise': 'strawberry',
    'fraises': 'strawberry',
    'framboise': 'raspberry',
    'framboises': 'raspberry',
    'myrtille': 'blueberry',
    'myrtilles': 'blueberry',
    'mûre': 'blackberry',
    'mûres': 'blackberry',
    'mure': 'blackberry',
    'mures': 'blackberry',
    'cerise': 'cherry',
    'cerises': 'cherry',
    'raisin': 'grape',
    'raisins': 'grape',
    'groseille': 'redcurrant',
    'groseilles': 'redcurrant',
    'cassis': 'blackcurrant',

    # ============================================================
    # VOLAILLE → chicken
    # ============================================================
    'poulet': 'chicken',
    'poulets': 'chicken',
    'dinde': 'chicken',
    'dindes': 'chicken',
    'pintade': 'chicken',
    'pintades': 'chicken',
    'caille': 'chicken',
    'cailles': 'chicken',
    'chapon': 'chicken',
    'chapons': 'chicken',
    'coq': 'chicken',

    # ============================================================
    # VIANDE ROUGE → beef
    # ============================================================
    'bœuf': 'beef',
    'boeuf': 'beef',
    'steak': 'beef',
    'steaks': 'beef',
    'rôti': 'beef',
    'roti': 'beef',
    'entrecôte': 'beef',
    'entrecote': 'beef',
    'bavette': 'beef',
    'rumsteck': 'beef',
    'veau': 'beef',
    'escalope': 'beef',
    'escalopes': 'beef',
    'agneau': 'beef',
    'gigot': 'beef',
    'souris': 'beef',

    # ============================================================
    # PORC (distinct)
    # ============================================================
    'porc': 'pork',
    'filet-mignon': 'pork',

    # ============================================================
    # CANARD (distinct)
    # ============================================================
    'canard': 'duck',
    'canards': 'duck',
    'magret': 'duck',
    'magrets': 'duck',

    # ============================================================
    # CHARCUTERIE → ham
    # ============================================================
    'jambon': 'ham',
    'jambons': 'ham',
    'prosciutto': 'ham',
    'coppa': 'ham',
    'bresaola': 'ham',
    'mortadelle': 'ham',
    'bacon': 'bacon',
    'lardon': 'bacon',
    'lardons': 'bacon',
    'lard': 'bacon',
    'pancetta': 'bacon',
    'saucisse': 'sausage',
    'saucisses': 'sausage',
    'merguez': 'sausage',
    'chorizo': 'sausage',
    'saucisson': 'sausage',
    'andouille': 'sausage',
    'andouillette': 'sausage',
    'chipolata': 'sausage',
    'chipolatas': 'sausage',
    'boudin': 'sausage',
    'boudins': 'sausage',
    'rillettes': 'pate',

    # ============================================================
    # POISSONS
    # ============================================================
    'poisson': 'fish',
    'poissons': 'fish',

    # Saumon (distinct)
    'saumon': 'salmon',
    'saumons': 'salmon',

    # Thon (distinct)
    'thon': 'tuna',
    'thons': 'tuna',

    # Poissons blancs → white-fish
    'cabillaud': 'white-fish',
    'cabillauds': 'white-fish',
    'colin': 'white-fish',
    'colins': 'white-fish',
    'lieu': 'white-fish',
    'merlu': 'white-fish',
    'dorade': 'white-fish',
    'dorades': 'white-fish',
    'bar': 'white-fish',
    'bars': 'white-fish',
    'sole': 'white-fish',
    'soles': 'white-fish',
    'flétan': 'white-fish',
    'fletan': 'white-fish',
    'églefin': 'white-fish',
    'eglefin': 'white-fish',
    'limande': 'white-fish',

    # Reste → fish (générique)
    'truite': 'fish',
    'truites': 'fish',
    'maquereau': 'fish',
    'maquereaux': 'fish',
    'sardine': 'fish',
    'sardines': 'fish',
    'anchois': 'fish',

    # ============================================================
    # CRUSTACÉS → shrimp
    # ============================================================
    'crevette': 'shrimp',
    'crevettes': 'shrimp',
    'gamba': 'shrimp',
    'gambas': 'shrimp',
    'langoustine': 'shrimp',
    'langoustines': 'shrimp',
    'homard': 'shrimp',
    'homards': 'shrimp',
    'crabe': 'shrimp',
    'crabes': 'shrimp',
    'langouste': 'shrimp',
    'langoustes': 'shrimp',

    # ============================================================
    # MOLLUSQUES → mussel
    # ============================================================
    'moule': 'mussel',
    'moules': 'mussel',
    'huître': 'oyster',
    'huîtres': 'oyster',
    'huitre': 'oyster',
    'huitres': 'oyster',
    'saint-jacques': 'mussel',
    'coquille': 'mussel',
    'coquilles': 'mussel',
    'calamar': 'mussel',
    'calamars': 'mussel',
    'seiche': 'mussel',
    'seiches': 'mussel',
    'poulpe': 'mussel',
    'poulpes': 'mussel',
    'encornet': 'mussel',
    'encornets': 'mussel',
    'palourde': 'mussel',
    'palourdes': 'mussel',

    # Autres fruits de mer
    'surimi': 'surimi',
    'surimis': 'surimi',
    'caviar': 'caviar',

    # ============================================================
    # PRODUITS LAITIERS
    # ============================================================
    'lait': 'milk',
    'beurre': 'butter',
    'yaourt': 'yogurt',
    'yaourts': 'yogurt',
    'yogourt': 'yogurt',
    'œuf': 'egg',
    'œufs': 'egg',
    'oeuf': 'egg',
    'oeufs': 'egg',

    # === CRÈME (+ fromages crémeux) → cream ===
    'crème': 'cream',
    'creme': 'cream',
    'ricotta': 'cream',
    'mascarpone': 'cream',
    'faisselle': 'cream',

    # === FROMAGES ===

    # Fromages à pâte molle, croûte fleurie → camembert
    'camembert': 'camembert',
    'coulommiers': 'camembert',
    'reblochon': 'camembert',
    'munster': 'camembert',
    'pont-l\'évêque': 'camembert',
    'chaource': 'camembert',

    # Brie (distinct)
    'brie': 'brie',

    # Fromages de chèvre → goat-cheese
    'chèvre': 'goat-cheese',
    'chevre': 'goat-cheese',
    'chavignol': 'goat-cheese',
    'crottin': 'goat-cheese',
    'bûche': 'goat-cheese',
    'buche': 'goat-cheese',

    # Fromages à pâte persillée → blue-cheese
    'roquefort': 'blue-cheese',
    'gorgonzola': 'blue-cheese',
    'bleu': 'blue-cheese',
    'fourme': 'blue-cheese',

    # Parmesan (distinct)
    'parmesan': 'parmesan',
    'parmigiano': 'parmesan',

    # Fromages durs / génériques → cheese
    'gruyère': 'cheese',
    'gruyere': 'cheese',
    'fromage': 'cheese',
    'fromages': 'cheese',
    'mozzarella': 'cheese',
    'comté': 'cheese',
    'comte': 'cheese',
    'emmental': 'cheese',
    'feta': 'cheese',
    'pecorino': 'cheese',
    'raclette': 'cheese',
    'cheddar': 'cheese',
    'gouda': 'cheese',
    'beaufort': 'cheese',
    'cantal': 'cheese',
    'mimolette': 'cheese',
    'maroilles': 'cheese',
    'boursin': 'cheese',

    # ============================================================
    # PÂTES → pasta
    # ============================================================
    'pâtes': 'pasta',
    'pates': 'pasta',

    # Pâtes spécifiques
    'spaghetti': 'spaghetti',
    'spaghettis': 'spaghetti',
    'tagliatelle': 'tagliatelle',
    'tagliatelles': 'tagliatelle',
    'fettuccine': 'tagliatelle',
    'fettuccines': 'tagliatelle',
    'farfalle': 'farfalle',
    'farfalles': 'farfalle',
    'fusilli': 'fusilli',
    'fusillis': 'fusilli',
    'penne': 'penne',
    'pennes': 'penne',
    'macaroni': 'macaroni',
    'macaronis': 'macaroni',
    'coquillette': 'macaroni',
    'coquillettes': 'macaroni',
    'lasagne': 'lasagna',
    'lasagnes': 'lasagna',

    # Reste → pasta (générique)
    'rigatoni': 'pasta',
    'rigatonis': 'pasta',
    'linguine': 'pasta',
    'linguines': 'pasta',
    'orecchiette': 'pasta',
    'orecchiettes': 'pasta',
    'tortellini': 'pasta',
    'tortellinis': 'pasta',
    'ravioli': 'pasta',
    'raviolis': 'pasta',
    'cannelloni': 'pasta',
    'cannellonis': 'pasta',
    'gnocchi': 'pasta',
    'gnocchis': 'pasta',
    'nouille': 'pasta',
    'nouilles': 'pasta',
    'vermicelle': 'pasta',
    'vermicelles': 'pasta',
    'conchiglie': 'pasta',
    'papardelle': 'pasta',
    'papardelles': 'pasta',
    'bucatini': 'pasta',

    # ============================================================
    # FÉCULENTS & CÉRÉALES
    # ============================================================
    'riz': 'rice',
    'basmati': 'rice',
    'arborio': 'rice',
    'quinoa': 'quinoa',
    'boulgour': 'bulgur',
    'boulghour': 'bulgur',
    'couscous': 'couscous',
    'semoule': 'couscous',
    'lentille': 'lentil',
    'lentilles': 'lentil',
    'corail': 'lentil',
    'pois-chiche': 'chickpea',
    'pois-chiches': 'chickpea',
    'avoine': 'oat',
    'flocon': 'oat',
    'flocons': 'oat',
    'pain': 'bread',
    'pains': 'bread',
    'chapelure': 'breadcrumb',
    'biscotte': 'rusk',
    'biscottes': 'rusk',
    'cracker': 'cracker',
    'crackers': 'cracker',
    'biscuit': 'cracker',
    'biscuits': 'cracker',
    'sablé': 'cracker',
    'sablés': 'cracker',
    'speculoos': 'speculos',
    'spéculoos': 'speculos',

    # ============================================================
    # FARINES & LEVURES
    # ============================================================
    'farine': 'flour',
    'farines': 'flour',
    'épeautre': 'flour',
    'epeautre': 'flour',
    'sarrasin': 'flour',
    'fécule': 'cornstarch',
    'fecule': 'cornstarch',
    'maïzena': 'cornstarch',
    'maizena': 'cornstarch',
    'levure': 'yeast',
    'levures': 'yeast',
    'bicarbonate': 'white-powder',

    # ============================================================
    # SUCRES & DOUCEURS
    # ============================================================
    'sucre': 'sugar',
    'sucres': 'sugar',
    'cassonade': 'brown-sugar',
    'vergeoise': 'brown-sugar',
    'miel': 'honey',
    'sirop': 'syrup',
    'érable': 'maple-syrup',
    'erable': 'maple-syrup',
    'confiture': 'jam',
    'confitures': 'jam',
    'chocolat': 'chocolate',
    'chocolats': 'chocolate',
    'cacao': 'cocoa',
    'pépite': 'chocolate',
    'pépites': 'chocolate',
    'nutella': 'spread',

    # ============================================================
    # NOIX & FRUITS SECS
    # ============================================================

    # Amande (distinct)
    'amande': 'almond',
    'amandes': 'almond',

    # Noisette (distinct)
    'noisette': 'hazelnut',
    'noisettes': 'hazelnut',

    # Cacahuète (distinct)
    'cacahuète': 'peanut',
    'cacahuètes': 'peanut',
    'cacahuete': 'peanut',
    'cacahuetes': 'peanut',
    'arachide': 'peanut',
    'arachides': 'peanut',

    # Reste → nuts (générique)
    'noix': 'nuts',
    'pistache': 'nuts',
    'pistaches': 'nuts',
    'cajou': 'nuts',
    'cajous': 'nuts',
    'pécan': 'nuts',
    'pecan': 'nuts',
    'pignon': 'nuts',
    'pignons': 'nuts',
    'macadamia': 'nuts',

    # Graines (distinctes)
    'tournesol': 'sunflower-seed',
    'lin': 'flax-seed',
    'chia': 'chia-seed',
    'sésame': 'sesame',
    'sesame': 'sesame',
    'pavot': 'poppy-seed',

    # ============================================================
    # HERBES → herbs
    # ============================================================
    # Tier 1 — herbes spécifiques
    'basilic': 'basil',
    'persil': 'parsley',
    'coriandre': 'cilantro',
    'menthe': 'mint',
    'romarin': 'rosemary',

    # Tier 2 — herbes spécifiques
    'thym': 'thyme',
    'ciboulette': 'chives',
    'ciboulettes': 'chives',
    'aneth': 'dill',
    'laurier': 'bay',

    'origan': 'oregano',

    # Reste → herbs (générique)
    'estragon': 'herbs',
    'sauge': 'herbs',
    'cerfeuil': 'herbs',
    'sarriette': 'herbs',
    'marjolaine': 'herbs',
    'herbe': 'herbs',
    'herbes': 'herbs',
    'provence': 'herbs',
    'fines-herbes': 'herbs',

    # ============================================================
    # ÉPICES
    # ============================================================
    'sel': 'salt',
    'poivre': 'pepper',
    'paprika': 'paprika',
    'espelette': 'paprika',
    'curry': 'curry',
    'curcuma': 'turmeric',
    'cumin': 'cumin',
    'cannelle': 'cinnamon',
    'muscade': 'nutmeg',
    'vanille': 'vanilla',
    'clou': 'clove',
    'clous': 'clove',
    'girofle': 'clove',
    'anis': 'star-anise',
    'étoilé': 'star-anise',
    'etoile': 'star-anise',
    'safran': 'saffron',
    'cardamome': 'cardamom',
    'cayenne': 'cayenne',
    'ras-el-hanout': 'ras-el-hanout',
    'zaatar': 'zaatar',
    'sumac': 'sumac',

    # ============================================================
    # HUILES → oil
    # ============================================================
    'huile': 'oil',
    'huiles': 'oil',

    # ============================================================
    # CONDIMENTS & SAUCES
    # ============================================================
    'vinaigre': 'vinegar',
    'vinaigres': 'vinegar',
    'moutarde': 'mustard',
    'moutardes': 'mustard',
    'ketchup': 'ketchup',
    'mayonnaise': 'mayonnaise',
    'mayo': 'mayonnaise',
    'soja': 'sauce',
    'worcestershire': 'worcestershire-sauce',
    'tabasco': 'tabasco',
    'vin': 'wine',
    'vins': 'wine',
    'bouillon': 'broth',
    'bouillons': 'broth',
    'coulis': 'tomato-sauce',
    'nuoc-mâm': 'sauce',
    'nuoc-mam': 'sauce',
    'miso': 'miso',
    'tahini': 'tahini',
    'cornichon': 'pickle',
    'cornichons': 'pickle',
    'câpre': 'caper',
    'câpres': 'caper',
    'capre': 'caper',
    'capres': 'caper',
    'pesto': 'pesto',
    'pesto-rosso': 'pesto-rosso',
    'harissa': 'harissa',
    'wasabi': 'wasabi',
    'béchamel': 'bechamel',
    'bechamel': 'bechamel',

    # ============================================================
    # BOISSONS
    # ============================================================
    'café': 'coffee',
    'cafe': 'coffee',
    'thé': 'tea',
    'the': 'tea',

    # ============================================================
    # AUTRES
    # ============================================================
    'tofu': 'tofu',
    'tempeh': 'tofu',
    'seitan': 'tofu',
    'eau': 'water',
    'pâté': 'pate',
    'pate': 'pate',
    'terrine': 'pate',
}
