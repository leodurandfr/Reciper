import { isSupportedSite, SUPPORTED_SITES } from "./supported-sites.js";
import { initLocale, t } from "./i18n-lite.js";

const DEFAULT_BACKEND_URL = "https://reciper-api-605923399344.europe-west1.run.app";

/**
 * Récupère l'URL du backend (custom ou défaut)
 */
async function getBackendUrl() {
  try {
    const result = await chrome.storage.local.get("settings");
    return result.settings?.backendUrl || DEFAULT_BACKEND_URL;
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

// Set pour tracker les URLs en cours de traitement
const processingUrls = new Set();

// Set pour les URLs à ne pas intercepter (bypass depuis le lien source)
const bypassUrls = new Set();

// Map pour stocker l'URL de la page précédente par tabId
const preNavigationUrls = new Map();

// Map pour stocker les promises de pre-fetch (détection recipe)
const pendingRecipeChecks = new Map();

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
 * Vérifie si le HTML contient des données structurées de type Recipe
 * (JSON-LD ou microdata Schema.org)
 */
function containsRecipe(html) {
  // JSON-LD : "@type": "Recipe" ou "@type": ["Recipe", ...]
  const jsonLd = /"@type"\s*:\s*(\[.*?)?"Recipe"/s.test(html);
  // Microdata : itemtype="https://schema.org/Recipe"
  const microdata = /itemtype\s*=\s*["']https?:\/\/schema\.org\/Recipe["']/i.test(html);
  return jsonLd || microdata;
}

/**
 * Fetch le HTML d'une URL et vérifie si la page contient une recette
 */
async function fetchAndCheckRecipe(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  if (!response.ok) return false;
  const html = await response.text();
  return containsRecipe(html);
}

/**
 * Scrape une recette via le backend
 */
async function scrapeRecipe(url) {
  const backendUrl = await getBackendUrl();
  const response = await fetch(`${backendUrl}/api/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: t("error") }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
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

  // Scraper via le backend
  const scrapedRecipe = await scrapeRecipe(url);

  // Sauvegarder dans chrome.storage.local
  const savedRecipe = await addRecipe(scrapedRecipe);

  return { success: true, recipeId: savedRecipe.id, existing: false };
}

/**
 * Enregistre le content script overlay sur les sites de recettes supportés.
 * Le script s'exécute à document_start (avant tout rendu) et injecte un overlay.
 */
chrome.runtime.onInstalled.addListener(async () => {
  const patterns = [];
  for (const domain of SUPPORTED_SITES) {
    patterns.push(`*://${domain}/*`);
    patterns.push(`*://*.${domain}/*`);
  }

  try {
    await chrome.scripting.unregisterContentScripts({ ids: ["reciper-overlay"] });
  } catch {}

  await chrome.scripting.registerContentScripts([{
    id: "reciper-overlay",
    matches: patterns,
    js: ["overlay-content-script.js"],
    runAt: "document_start",
    allFrames: false,
  }]);
});

/**
 * Capture l'URL de la page précédente et lance le pre-fetch de détection recipe
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = new URL(details.url);
  if (!isSupportedSite(url.hostname)) return;

  // Capturer l'URL de la page précédente
  try {
    const tab = await chrome.tabs.get(details.tabId);
    preNavigationUrls.set(details.tabId, tab.url);
  } catch {}

  // Lancer le pre-fetch pour détecter @type: Recipe avant onCommitted
  const checkPromise = fetchAndCheckRecipe(details.url);
  pendingRecipeChecks.set(details.url, checkPromise);
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
    if (!isSupportedSite(url.hostname)) return;

    // Bypass si demandé (retour depuis Reciper vers le site)
    if (bypassUrls.has(details.url)) {
      bypassUrls.delete(details.url);
      chrome.tabs.sendMessage(details.tabId, { type: "REMOVE_OVERLAY" }).catch(() => {});
      return;
    }

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

      const encodedUrl = encodeURIComponent(details.url);
      const encodedReferrer = encodeURIComponent(referrerUrl);
      const loadingUrl = chrome.runtime.getURL(
        `index.html#/loading?url=${encodedUrl}&returnUrl=${encodedUrl}&referrerUrl=${encodedReferrer}`
      );
      chrome.tabs.update(details.tabId, { url: loadingUrl });
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

  // Bypass d'interception pour le lien source
  if (message.type === "BYPASS_URL") {
    bypassUrls.add(message.url);
    setTimeout(() => bypassUrls.delete(message.url), 10000);
    sendResponse({ success: true });
    return true;
  }

});

// Initialiser la locale et log au démarrage
initLocale().then(() => {
  console.log(t("extensionLoaded"));
});
