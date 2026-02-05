import { isSupportedSite } from "./supported-sites.js";

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
    const error = await response.json().catch(() => ({ detail: "Erreur" }));
    throw new Error(error.detail || `Erreur HTTP ${response.status}`);
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
 * Intercepte les navigations vers les sites de recettes supportés
 * Redirige vers la page de chargement Reciper avant l'affichage du site
 */
chrome.webNavigation.onCommitted.addListener(
  async (details) => {
    // Ignorer les iframes et les navigations internes
    if (details.frameId !== 0) return;
    if (details.transitionType === "auto_subframe") return;

    const url = new URL(details.url);

    // Vérifier si c'est un site supporté
    if (!isSupportedSite(url.hostname)) return;

    // Bypass si demandé (lien source depuis Reciper)
    if (bypassUrls.has(details.url)) {
      bypassUrls.delete(details.url);
      return;
    }

    // Éviter les doubles traitements
    if (processingUrls.has(details.url)) return;
    processingUrls.add(details.url);

    // Rediriger immédiatement vers la page de chargement
    const encodedUrl = encodeURIComponent(details.url);
    const loadingUrl = chrome.runtime.getURL(
      `index.html#/loading?url=${encodedUrl}&returnUrl=${encodedUrl}`
    );
    chrome.tabs.update(details.tabId, { url: loadingUrl });

    setTimeout(() => processingUrls.delete(details.url), 5000);
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

// Log au démarrage
console.log("Reciper: Extension chargée - 606 sites supportés");
