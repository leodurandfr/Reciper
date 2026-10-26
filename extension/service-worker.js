// Généré au build par scripts/vendor-pyodide.mjs depuis recipe_scrapers.SCRAPERS
import { SUPPORTED_SITES } from "./supported-sites.js";
import { initLocale, t } from "./i18n-lite.js";

// Set pour tracker les URLs en cours de traitement
const processingUrls = new Set();

// Set pour les URLs à ne pas intercepter (bypass depuis le lien source)
const bypassUrls = new Set();

// URL dont la navigation a consommé un bypass, par tabId : sur les sites non supportés,
// la détection arrive bien plus tard (document_end), après l'expiration du bypass
const bypassedTabUrls = new Map();

// Map pour stocker l'URL de la page précédente par tabId
const preNavigationUrls = new Map();

// Map pour stocker les promises de pre-fetch (détection recipe)
const pendingRecipeChecks = new Map();

// Map pour garder le HTML pré-fetché (réutilisé par le scraping, évite un 2e téléchargement)
const pageHtmlCache = new Map();
const PAGE_HTML_TTL_MS = 60000;

const FETCH_TIMEOUT_MS = 15000;

const OVERLAY_SCRIPT_ID = "reciper-overlay";
const DETECT_SCRIPT_ID = "reciper-detect";

/**
 * Vérifie si un hostname correspond à un site supporté (même règle que recipe-scrapers :
 * le domaine exact, avec ou sans « www. »)
 * @param {string} hostname - Le hostname à vérifier (ex: "www.marmiton.org")
 * @returns {boolean}
 */
function isSupportedSite(hostname) {
  return SUPPORTED_SITES.has(hostname.replace(/^www\./, ""));
}

/**
 * Motifs des sites supportés pour les content scripts (mêmes domaines que isSupportedSite)
 */
function supportedSitePatterns() {
  const patterns = [];
  for (const domain of SUPPORTED_SITES) {
    patterns.push(`*://${domain}/*`);
    patterns.push(`*://www.${domain}/*`);
  }
  return patterns;
}

/**
 * Option « Récupérer les recettes sur tous les sites » (désactivée par défaut).
 * Lue une fois puis gardée en mémoire jusqu'à sa prochaine modification.
 */
let scrapeAnySitePromise = null;

function isScrapeAnySiteEnabled() {
  scrapeAnySitePromise ??= chrome.storage.local
    .get("settings")
    .then((result) => Boolean(result.settings?.scrapeAnySite))
    .catch(() => false);
  return scrapeAnySitePromise;
}
// Couvre le premier démarrage de Python (plusieurs secondes, davantage sur une machine lente)
const SCRAPE_TIMEOUT_MS = 60000;

/**
 * Recupere l'index des recettes depuis chrome.storage.local
 */
async function getIndex() {
  const result = await chrome.storage.local.get("recipes_index");
  return result.recipes_index || { nextId: 1, ids: [], urlMap: {} };
}

/**
 * Recupere une recette par URL
 */
async function getRecipeByUrl(url) {
  const index = await getIndex();
  const id = index.urlMap[url];
  if (!id) return null;
  const result = await chrome.storage.local.get(`recipe_${id}`);
  return result[`recipe_${id}`] || null;
}

/**
 * Ajoute une recette dans chrome.storage.local
 */
async function addRecipe(recipe) {
  const index = await getIndex();

  // Verifier si la recette existe deja
  if (recipe.url && index.urlMap[recipe.url]) {
    const existingId = index.urlMap[recipe.url];
    const result = await chrome.storage.local.get(`recipe_${existingId}`);
    return result[`recipe_${existingId}`];
  }

  const id = index.nextId;
  const recipeData = {
    ...recipe,
    id,
    is_favorite: false,
    image_base64: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  index.nextId = id + 1;
  index.ids.unshift(id);
  if (recipe.url) {
    index.urlMap[recipe.url] = id;
  }

  await chrome.storage.local.set({
    [`recipe_${id}`]: recipeData,
    recipes_index: index,
  });

  return recipeData;
}

/**
 * Vrai si un bloc JSON-LD décrit une recette comme sujet de la page : nœud racine, entrée
 * de @graph ou mainEntity d'une page. Les recettes seulement listées ou citées (ItemList,
 * relatedRecipes…) ne comptent pas, pour ne pas intercepter les pages de liste.
 */
function jsonLdHasRecipe(node, depth = 0) {
  if (!node || typeof node !== "object" || depth > 4) return false;
  if (Array.isArray(node)) return node.some((item) => jsonLdHasRecipe(item, depth + 1));
  const types = [].concat(node["@type"] ?? []);
  // "Recipe", "schema:Recipe" ou "https://schema.org/Recipe"
  if (types.some((type) => typeof type === "string" && /(^|[/:])Recipe$/.test(type))) return true;
  return [node["@graph"], node.mainEntity].some((value) => jsonLdHasRecipe(value, depth + 1));
}

/**
 * Vérifie si le HTML contient des données structurées de type Recipe
 * (JSON-LD ou microdata Schema.org)
 */
function containsRecipe(html) {
  const jsonLdBlocks = html.matchAll(
    /<script[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const [, content] of jsonLdBlocks) {
    try {
      if (jsonLdHasRecipe(JSON.parse(content))) return true;
    } catch {
      // JSON-LD invalide (virgules en trop, commentaires…) que recipe-scrapers sait souvent lire
      if (/"@type"\s*:\s*(\[[^\]]*)?"([^"]*[/:])?Recipe"/.test(content)) return true;
    }
  }
  // Microdata : itemtype="https://schema.org/Recipe" (éventuellement parmi plusieurs types)
  return /itemtype\s*=\s*["'][^"']*schema\.org\/Recipe\b/i.test(html);
}

/**
 * Fetch le HTML d'une URL
 */
async function fetchPageHtml(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`Impossible de récupérer la page: HTTP ${response.status}`);
  }
  return response.text();
}

/**
 * Fetch le HTML d'une URL et vérifie si la page contient une recette.
 * Le HTML est gardé en cache pour le scraping qui suit.
 */
async function fetchAndCheckRecipe(url) {
  const html = await fetchPageHtml(url).catch(() => null);
  if (!html) return false;
  cachePageHtml(url, html);
  return containsRecipe(html);
}

/**
 * Garde le HTML d'une page pour le scraping qui suit (évite de la retélécharger)
 */
function cachePageHtml(url, html) {
  const entry = { html };
  pageHtmlCache.set(url, entry);
  setTimeout(() => {
    // Ne pas effacer une entrée plus récente pour la même URL
    if (pageHtmlCache.get(url) === entry) pageHtmlCache.delete(url);
  }, PAGE_HTML_TTL_MS);
}

/**
 * Création / fermeture du document offscreen qui exécute recipe-scrapers (Pyodide).
 * Les opérations passent par une file unique : deux appels simultanés (préchauffage et
 * scraping) ne peuvent pas créer deux documents, et un appel attend la fin d'une
 * création en cours (hasDocument() est vrai avant que le document soit chargé).
 */
let offscreenQueue = Promise.resolve();
let scrapesInFlight = 0;

function queueOffscreenOperation(operation) {
  offscreenQueue = offscreenQueue.catch(() => {}).then(operation);
  return offscreenQueue;
}

function ensureOffscreenDocument() {
  return queueOffscreenOperation(async () => {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["WORKERS"],
      justification: "Run recipe-scrapers (Python, via Pyodide) in a Web Worker to parse recipe pages",
    });
  });
}

function closeOffscreenDocument() {
  return queueOffscreenOperation(async () => {
    if (await chrome.offscreen.hasDocument()) await chrome.offscreen.closeDocument();
  });
}

/**
 * Envoie le HTML au document offscreen, en réessayant brièvement s'il n'écoute pas encore
 */
async function sendToOffscreen(message) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      if (attempt >= 10 || !String(error.message).includes("Receiving end does not exist")) throw error;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}

/**
 * Scrape une recette localement (recipe-scrapers dans le document offscreen)
 */
async function scrapeRecipe(url) {
  scrapesInFlight++;
  try {
    const cached = pageHtmlCache.get(url);
    pageHtmlCache.delete(url);
    const html = cached?.html ?? (await fetchPageHtml(url));

    await ensureOffscreenDocument();
    let timeoutId;
    const timeout = new Promise((resolve) => {
      timeoutId = setTimeout(
        () => resolve({ success: false, error: "Délai dépassé lors de l'analyse de la recette", fatal: true }),
        SCRAPE_TIMEOUT_MS
      );
    });
    const response = await Promise.race([
      sendToOffscreen({ target: "offscreen", type: "SCRAPE_HTML", url, html }),
      timeout,
    ]).finally(() => clearTimeout(timeoutId));

    if (!response?.success) {
      // Python n'a pas pu se charger, ou le worker est bloqué / planté : repartir de zéro
      // au prochain scraping plutôt que de réutiliser un document cassé
      if (response?.fatal) closeOffscreenDocument().catch(() => {});
      throw new Error(response?.error || t("error"));
    }
    return response.recipe;
  } finally {
    scrapesInFlight--;
  }
}

/**
 * Scrape et sauvegarde une recette
 */
async function scrapeAndSave(url) {
  // Vérifier si la recette existe déjà
  const existing = await getRecipeByUrl(url);
  if (existing) {
    return { success: true, recipeId: existing.id, existing: true };
  }

  // Scraper localement (Pyodide)
  const scrapedRecipe = await scrapeRecipe(url);

  // Sauvegarder dans chrome.storage.local
  const savedRecipe = await addRecipe(scrapedRecipe);

  return { success: true, recipeId: savedRecipe.id, existing: false };
}

/**
 * Enregistre les content scripts :
 * - overlay sur les sites supportés : s'exécute à document_start (avant tout rendu)
 *   et masque la page pendant que le service worker vérifie si c'est une recette
 * - détection sur tous les autres sites, si l'option « tous les sites » est activée :
 *   s'exécute une fois le HTML chargé et signale les pages qui déclarent une recette
 */
async function registerContentScripts(refresh) {
  const registered = new Set(
    (await chrome.scripting.getRegisteredContentScripts()).map((script) => script.id)
  );
  const wantDetect = await isScrapeAnySiteEnabled();
  const supportedPatterns = supportedSitePatterns();

  // À l'installation / mise à jour, tout réenregistrer (la liste des sites a pu changer) ;
  // sinon seul le script de détection est ajouté ou retiré, l'overlay n'est jamais retiré
  const toRemove = [...registered].filter(
    (id) => refresh || (id === DETECT_SCRIPT_ID && !wantDetect)
  );
  if (toRemove.length > 0) await chrome.scripting.unregisterContentScripts({ ids: toRemove });

  const toAdd = [];
  if (refresh || !registered.has(OVERLAY_SCRIPT_ID)) {
    toAdd.push({
      id: OVERLAY_SCRIPT_ID,
      matches: supportedPatterns,
      js: ["overlay-content-script.js"],
      runAt: "document_start",
      allFrames: false,
    });
  }
  if (wantDetect && (refresh || !registered.has(DETECT_SCRIPT_ID))) {
    toAdd.push({
      id: DETECT_SCRIPT_ID,
      matches: ["http://*/*", "https://*/*"],
      excludeMatches: supportedPatterns,
      js: ["detect-content-script.js"],
      runAt: "document_end",
      allFrames: false,
    });
  }
  if (toAdd.length > 0) await chrome.scripting.registerContentScripts(toAdd);
}

let contentScriptsQueue = Promise.resolve();

function syncContentScripts({ refresh = false } = {}) {
  contentScriptsQueue = contentScriptsQueue
    .then(() => registerContentScripts(refresh))
    .catch((error) => console.error("Reciper: content scripts", error));
  return contentScriptsQueue;
}

chrome.runtime.onInstalled.addListener(() => syncContentScripts({ refresh: true }));

// L'option « tous les sites » a changé : (dés)activer le script de détection
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.settings) return;
  const before = Boolean(changes.settings.oldValue?.scrapeAnySite);
  const after = Boolean(changes.settings.newValue?.scrapeAnySite);
  scrapeAnySitePromise = Promise.resolve(after);
  if (before !== after) syncContentScripts();
});

/**
 * Ouvre la page de chargement de Reciper dans l'onglet, qui lance le scraping de l'URL
 */
function openLoadingPage(tabId, url, referrerUrl) {
  const encodedUrl = encodeURIComponent(url);
  const encodedReferrer = encodeURIComponent(referrerUrl);
  const loadingUrl = chrome.runtime.getURL(
    `index.html#/loading?url=${encodedUrl}&returnUrl=${encodedUrl}&referrerUrl=${encodedReferrer}`
  );
  return chrome.tabs.update(tabId, { url: loadingUrl });
}

/**
 * Page d'un site non supporté signalée par detect-content-script.js (option « tous les sites ») :
 * si elle contient bien une recette, l'ouvrir dans Reciper avec le HTML déjà chargé par l'onglet
 */
async function handleDetectedRecipePage(tabId, url, html) {
  if (bypassedTabUrls.get(tabId) === url) {
    bypassedTabUrls.delete(tabId);
    return;
  }
  if (!(await isScrapeAnySiteEnabled())) return;
  if (processingUrls.has(url) || !containsRecipe(html)) return;
  processingUrls.add(url);

  try {
    // Vérifier que l'onglet est toujours sur la même page
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab || tab.url !== url) return;

    const referrerUrl = preNavigationUrls.get(tabId) || "";
    preNavigationUrls.delete(tabId);

    cachePageHtml(url, html);
    ensureOffscreenDocument().catch(() => {});
    await openLoadingPage(tabId, url, referrerUrl);
  } finally {
    processingUrls.delete(url);
  }
}

/**
 * Capture l'URL de la page précédente et lance le pre-fetch de détection recipe
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = new URL(details.url);
  if (!/^https?:$/.test(url.protocol)) return;
  const supported = isSupportedSite(url.hostname);
  if (!supported && !(await isScrapeAnySiteEnabled())) return;

  // Capturer l'URL de la page précédente
  try {
    const tab = await chrome.tabs.get(details.tabId);
    preNavigationUrls.set(details.tabId, tab.url);
  } catch {}

  // Sites non supportés : la détection se fait sur la page chargée (detect-content-script.js)
  if (!supported) return;

  // Lancer le pre-fetch pour détecter @type: Recipe avant onCommitted
  const checkPromise = fetchAndCheckRecipe(details.url);
  pendingRecipeChecks.set(details.url, checkPromise);

  // Charger Python dès maintenant (premier démarrage de plusieurs secondes),
  // sans attendre de savoir si la page est une recette
  ensureOffscreenDocument().catch(() => {});
});

/**
 * Intercepte les navigations vers les sites de recettes supportés.
 * L'overlay est déjà injecté par le content script (document_start).
 * Ici on vérifie si c'est une recette, et on retire l'overlay sinon.
 */
chrome.webNavigation.onCommitted.addListener(
  async (details) => {
    if (details.frameId !== 0) return;
    if (details.transitionType === "auto_subframe") return;

    const url = new URL(details.url);
    const supported = isSupportedSite(url.hostname);

    // Bypass si demandé (retour depuis Reciper vers le site)
    bypassedTabUrls.delete(details.tabId);
    if (bypassUrls.has(details.url)) {
      bypassUrls.delete(details.url);
      if (supported) {
        chrome.tabs.sendMessage(details.tabId, { type: "REMOVE_OVERLAY" }).catch(() => {});
      } else {
        // Consommé plus tard par handleDetectedRecipePage (option « tous les sites »)
        bypassedTabUrls.set(details.tabId, details.url);
      }
      return;
    }
    if (!supported) return;

    // Bypass les navigations back/forward du navigateur
    // (filet de sécurité pour les cas cross-origin où replaceState ne fonctionne pas)
    if (details.transitionQualifiers?.includes("forward_back")) {
      chrome.tabs.sendMessage(details.tabId, { type: "REMOVE_OVERLAY" }).catch(() => {});
      return;
    }

    // Éviter les doubles traitements
    if (processingUrls.has(details.url)) return;
    processingUrls.add(details.url);

    try {
      // Consommer le pre-fetch lancé par onBeforeNavigate (ou fallback)
      const isRecipe = pendingRecipeChecks.has(details.url)
        ? await pendingRecipeChecks.get(details.url)
        : await fetchAndCheckRecipe(details.url);
      pendingRecipeChecks.delete(details.url);

      if (!isRecipe) {
        // Pas une recette : retirer l'overlay injecté par le content script
        chrome.tabs.sendMessage(details.tabId, { type: "REMOVE_OVERLAY" }).catch(() => {});
        return;
      }

      // Vérifier que l'onglet est toujours sur la même page
      const tab = await chrome.tabs.get(details.tabId).catch(() => null);
      if (!tab || tab.url !== details.url) return;

      // Récupérer l'URL de la page précédente (capturée par onBeforeNavigate)
      const referrerUrl = preNavigationUrls.get(details.tabId) || "";
      preNavigationUrls.delete(details.tabId);

      // Remplacer l'entrée d'historique de la page recette par l'URL précédente
      // pour que le bouton retour du navigateur ne revienne pas sur cette page interceptée
      if (referrerUrl) {
        try {
          const referrerOrigin = new URL(referrerUrl).origin;
          if (url.origin === referrerOrigin) {
            await chrome.scripting.executeScript({
              target: { tabId: details.tabId },
              func: (replaceUrl) => history.replaceState(null, "", replaceUrl),
              args: [referrerUrl],
            });
          }
        } catch {}
      }

      await openLoadingPage(details.tabId, details.url, referrerUrl);
    } catch {
      // En cas d'erreur, retirer l'overlay pour ne pas bloquer la page
      chrome.tabs.sendMessage(details.tabId, { type: "REMOVE_OVERLAY" }).catch(() => {});
    } finally {
      processingUrls.delete(details.url);
    }
  },
  {
    url: [{ schemes: ["http", "https"] }],
  }
);

/**
 * Gestionnaire de messages (pour le popup et la page de chargement)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPE_AND_SAVE") {
    scrapeAndSave(message.url)
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({ success: false, error: error.message })
      );
    return true;
  }

  // Le document offscreen est inactif depuis un moment : le fermer pour libérer la mémoire
  if (message.type === "OFFSCREEN_IDLE") {
    if (scrapesInFlight === 0) closeOffscreenDocument().catch(() => {});
    return;
  }

  // Page d'un site non supporté qui semble contenir une recette (option « tous les sites »)
  if (message.type === "RECIPE_PAGE_DETECTED") {
    if (sender.tab && sender.frameId === 0) {
      handleDetectedRecipePage(sender.tab.id, message.url, message.html).catch(() => {});
    }
    return;
  }

  // Bypass d'interception pour le lien source
  if (message.type === "BYPASS_URL") {
    bypassUrls.add(message.url);
    setTimeout(() => bypassUrls.delete(message.url), 10000);
    sendResponse({ success: true });
    return true;
  }

});

/**
 * Ouvre l'app Reciper dans un nouvel onglet au clic sur l'icône de l'extension
 */
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

// L'URL de la page précédente n'est plus utile une fois l'onglet fermé
chrome.tabs.onRemoved.addListener((tabId) => {
  preNavigationUrls.delete(tabId);
  bypassedTabUrls.delete(tabId);
});

// Initialiser la locale et log au démarrage
initLocale().then(() => {
  console.log(t("extensionLoaded").replace("{count}", SUPPORTED_SITES.size));
});
