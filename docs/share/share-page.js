/*
 * Rendu de la page de partage. Le fragment de l'URL est fabriqué par n'importe qui :
 * son contenu est validé avant usage et n'est inséré qu'avec textContent.
 * Format produit par l'extension : src/services/share.js.
 */
(function() {
  // Images d'ingrédients servies depuis le dépôt (mêmes fichiers que l'extension)
  var INGREDIENT_IMAGES = 'https://raw.githubusercontent.com/leodurandfr/Reciper/main/extension/src/assets/ingredients/';

  // Bornes contre les liens forgés (bombe de décompression, sélecteur géant)
  var MAX_FRAGMENT_LENGTH = 200000;
  var MAX_JSON_BYTES = 1000000;
  var MAX_PORTIONS = 100;

  // --- Portion Calculator (from usePortionCalculator.js) ---
  const FRACTION_MAP = {
    0.25: '¼', 0.5: '½', 0.75: '¾',
    0.333: '⅓', 0.667: '⅔',
    0.125: '⅛', 0.375: '⅜', 0.625: '⅝', 0.875: '⅞',
  };
  const UNICODE_FRACTIONS = {
    '½': 0.5, '⅓': 1/3, '⅔': 2/3, '¼': 0.25, '¾': 0.75,
    '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
    '⅙': 1/6, '⅚': 5/6, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
  };

  // Même motif pour l'affichage (splitQty) et la mise à l'échelle (extractQuantity) :
  // « 1½ », « 1 ½ », « 1 1/2 », « 1/2 », « 1,5 », « 2 »
  const QUANTITY_RE = /^(?:(\d+\s*)?([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])|(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)|(\d+[.,]\d+)|(\d+))/;
  // Fourchette : « 2-3 », « 2 à 3 », « 1 to 1 1/2 »… (RANGE_PATTERN de l'extension) ;
  // seuls la borne basse et le séparateur sont capturés, la borne haute est lue par QUANTITY_RE
  const RANGE_RE = /^(\d+(?:[.,]\d+)?)(\s*[-–]\s*|\s+(?:à|a|to|ou|or)\s+)(?=[\d½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/;
  const UNIT_RE = /^\s*(?:kg|mg|cl|dl|ml|g|l)\b/;

  function splitQty(text) {
    var t = text.trim();
    var range = t.match(RANGE_RE);
    var start = range ? range[0].length : 0;
    var m = t.slice(start).match(QUANTITY_RE);
    if (!m) return { qty: '', rest: t };
    var length = start + m[0].length;
    var unit = t.slice(length).match(UNIT_RE);
    if (unit) length += unit[0].length;
    return { qty: t.slice(0, length), rest: t.slice(length).trimStart() };
  }

  function extractQuantity(ingredient) {
    const original = ingredient.trim();
    const match = original.match(QUANTITY_RE);
    if (!match) return { quantity: null, rest: original };
    let quantity = null;
    const matchLength = match[0].length;
    if (match[2]) {
      const fraction = UNICODE_FRACTIONS[match[2]] || 0;
      const whole = match[1] ? parseInt(match[1].trim(), 10) : 0;
      quantity = whole + fraction;
    } else if (match[3] && match[4] && match[5]) {
      const denom = parseInt(match[5], 10);
      quantity = denom !== 0 ? parseInt(match[3], 10) + parseInt(match[4], 10) / denom : null;
    } else if (match[6] && match[7]) {
      const denom = parseInt(match[7], 10);
      quantity = denom !== 0 ? parseInt(match[6], 10) / denom : null;
    } else if (match[8]) {
      quantity = parseFloat(match[8].replace(',', '.'));
    } else if (match[9]) {
      quantity = parseInt(match[9], 10);
    }
    if (quantity === null) return { quantity: null, rest: original };
    return { quantity, rest: original.slice(matchLength).trim() };
  }

  function formatQuantity(q) {
    if (q === null || q === undefined) return '';
    if (Number.isInteger(q)) return q.toString();
    const whole = Math.floor(q);
    const frac = Math.round((q - whole) * 1000) / 1000;
    for (const [dec, sym] of Object.entries(FRACTION_MAP)) {
      if (Math.abs(frac - parseFloat(dec)) < 0.01) return whole > 0 ? whole + sym : sym;
    }
    const rounded = Math.round(q * 10) / 10;
    // Petite quantité non nulle : garder 1 chiffre significatif plutôt qu'afficher « 0 »
    if (rounded === 0 && q > 0) return Number(q.toPrecision(1)).toString();
    return rounded.toString().replace(/\.0$/, '');
  }

  function scaleIngredient(ingredient, originalPortions, newPortions) {
    if (!originalPortions) return ingredient;
    const ratio = newPortions / originalPortions;
    // Fourchette : mettre les deux bornes à l'échelle en gardant le séparateur d'origine
    const range = ingredient.trim().match(RANGE_RE);
    if (range) {
      const max = extractQuantity(ingredient.trim().slice(range[0].length));
      if (max.quantity !== null) {
        const scaledRange = formatQuantity(parseFloat(range[1].replace(',', '.')) * ratio) + range[2] +
          formatQuantity(max.quantity * ratio);
        return (scaledRange + ' ' + max.rest).trim();
      }
    }
    const { quantity, rest } = extractQuantity(ingredient);
    if (quantity === null) return ingredient;
    const scaled = quantity * ratio;
    return (formatQuantity(scaled) + ' ' + rest).trim();
  }

  async function decodeRecipe(fragment) {
    if (!fragment || fragment.length > MAX_FRAGMENT_LENGTH) throw new Error('invalid fragment');
    var b64 = fragment.replace(/-/g, '+').replace(/_/g, '/');
    var bytes = Uint8Array.from(atob(b64), function(c) { return c.charCodeAt(0); });
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));

    // Lecture bornée du flux décompressé
    var reader = stream.getReader();
    var chunks = [];
    var total = 0;
    for (;;) {
      var result = await reader.read();
      if (result.done) break;
      total += result.value.length;
      if (total > MAX_JSON_BYTES) {
        reader.cancel();
        throw new Error('payload too large');
      }
      chunks.push(result.value);
    }
    return normalizeRecipe(JSON.parse(await new Blob(chunks).text()));
  }

  // --- Validation du JSON décodé ---
  function str(value) {
    return typeof value === 'string' ? value : '';
  }

  function minutes(value) {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    var n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }

  function httpUrl(value) {
    try {
      var url = new URL(str(value));
      return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
    } catch (e) {
      return null;
    }
  }

  function normalizeRecipe(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid recipe');
    var imageIds = Array.isArray(data.image_ids) ? data.image_ids : [];
    var ingredients = [];
    // Chaque ingrédient garde l'image_id de son index d'origine
    (Array.isArray(data.ingredients) ? data.ingredients : []).forEach(function(text, i) {
      if (typeof text !== 'string' || !text.trim()) return;
      var imageId = imageIds[i];
      ingredients.push({
        text: text,
        imageId: typeof imageId === 'string' && /^[a-z0-9-]+$/.test(imageId) ? imageId : null,
      });
    });
    return {
      title: str(data.title).trim() || 'Recette',
      imageUrl: httpUrl(data.image_url),
      ingredients: ingredients,
      instructions: (Array.isArray(data.instructions) ? data.instructions : []).filter(function(step) {
        return typeof step === 'string' && step.trim();
      }),
      prepTime: minutes(data.prep_time),
      cookTime: minutes(data.cook_time),
      yields: typeof data.yields === 'string' || typeof data.yields === 'number' ? String(data.yields) : '',
      // L'hôte affiché est tiré de l'URL elle-même (le champ « host » des anciens liens est ignoré)
      sourceUrl: httpUrl(data.url),
    };
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function addTime(container, label, minutes) {
    if (!minutes) return;
    var tag = el('span', 'tag');
    tag.append(el('span', 'tag-label', label), el('span', 'tag-value', minutes + 'min'));
    container.append(tag);
    container.hidden = false;
  }

  function setIngredientText(li, text) {
    var p = splitQty(text);
    li.querySelector('.ingredient-quantity').textContent = p.qty;
    li.querySelector('.ingredient-text').textContent = p.rest;
  }

  function render(recipe) {
    document.title = recipe.title + ' — Reciper';
    document.getElementById('title').textContent = recipe.title;

    var times = document.getElementById('times');
    addTime(times, 'Prép.', recipe.prepTime);
    addTime(times, 'Cuisson', recipe.cookTime);

    if (recipe.imageUrl) {
      var image = document.getElementById('image');
      image.src = recipe.imageUrl.href;
      image.alt = recipe.title;
      document.getElementById('image-container').hidden = false;
    }

    var list = document.getElementById('ingredients-list');
    recipe.ingredients.forEach(function(ingredient) {
      var li = el('li');
      li.setAttribute('data-original', ingredient.text);
      var imageBox = el('div', 'ingredient-image');
      if (ingredient.imageId) {
        var img = el('img');
        img.src = INGREDIENT_IMAGES + ingredient.imageId + '.png';
        img.alt = '';
        img.width = 36;
        img.height = 36;
        img.onerror = function() { this.style.display = 'none'; };
        imageBox.append(img);
      }
      var content = el('div', 'ingredient-content');
      content.append(el('span', 'ingredient-quantity'), el('span', 'ingredient-text'));
      li.append(imageBox, content);
      setIngredientText(li, ingredient.text);
      list.append(li);
    });

    var steps = document.getElementById('instructions-list');
    recipe.instructions.forEach(function(instruction, i) {
      var li = el('li');
      li.append(el('span', 'step-number', 'Étape ' + (i + 1)), el('p', 'step-text', instruction));
      steps.append(li);
    });

    if (recipe.sourceUrl) {
      var source = document.getElementById('source');
      source.href = recipe.sourceUrl.href;
      source.textContent = 'Source : ' + recipe.sourceUrl.hostname.replace(/^www\./, '');
      source.hidden = false;
    }

    setupPortions(recipe.yields);
    document.getElementById('recipe').hidden = false;
  }

  function setupPortions(yieldsStr) {
    var yieldsMatch = yieldsStr ? yieldsStr.match(/(\d+)/) : null;
    var originalPortions = yieldsMatch ? parseInt(yieldsMatch[1], 10) : null;
    // Au-delà, ce n'est pas un nombre de portions (« 1000 g ») ou le lien est forgé
    if (!originalPortions || originalPortions > MAX_PORTIONS) return;

    var select = document.getElementById('portion-select');
    var display = document.getElementById('portion-display');
    var items = document.querySelectorAll('#ingredients-list li');

    var max = Math.max(12, originalPortions);
    for (var i = 1; i <= max; i++) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      if (i === originalPortions) opt.selected = true;
      select.appendChild(opt);
    }

    display.textContent = originalPortions;
    document.getElementById('portion-selector').hidden = false;

    select.addEventListener('change', function() {
      var currentPortions = parseInt(this.value, 10);
      display.textContent = currentPortions;
      items.forEach(function(li) {
        setIngredientText(li, scaleIngredient(li.getAttribute('data-original'), originalPortions, currentPortions));
      });
    });
  }

  decodeRecipe(location.hash.slice(1))
    .then(render)
    .catch(function() { document.getElementById('error').hidden = false; });
})();
