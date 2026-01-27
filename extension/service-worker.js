import { isSupportedSite } from "./supported-sites.js";

const DEFAULT_BACKEND_URL = "http://localhost:8080";

// Set pour tracker les URLs en cours de traitement
const processingUrls = new Set();

/**
 * Récupère l'URL du backend depuis les settings
 */
async function getBackendUrl() {
  try {
    const result = await chrome.storage.local.get("settings");
    return result.settings?.backendUrl || DEFAULT_BACKEND_URL;
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

/**
 * Ouvre IndexedDB et retourne une promesse avec la DB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ReciperDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("recipes")) {
        const store = db.createObjectStore("recipes", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("url", "url", { unique: true });
        store.createIndex("is_favorite", "is_favorite", { unique: false });
        store.createIndex("created_at", "created_at", { unique: false });
        store.createIndex("host", "host", { unique: false });
      }
    };
  });
}

/**
 * Récupère une recette par URL depuis IndexedDB
 */
async function getRecipeByUrl(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["recipes"], "readonly");
    const store = transaction.objectStore("recipes");
    const index = store.index("url");
    const request = index.get(url);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Ajoute une recette à IndexedDB
 */
async function addRecipe(recipe) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["recipes"], "readwrite");
    const store = transaction.objectStore("recipes");

    const recipeData = {
      ...recipe,
      is_favorite: false,
      image_blob: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const request = store.add(recipeData);

    request.onsuccess = () => resolve({ ...recipeData, id: request.result });
    request.onerror = () => reject(request.error);
  });
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

  // Sauvegarder dans IndexedDB
  const savedRecipe = await addRecipe(scrapedRecipe);

  return { success: true, recipeId: savedRecipe.id, existing: false };
}

/**
 * Intercepte les navigations vers les sites de recettes supportés
 */
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    // Ignorer les iframes
    if (details.frameId !== 0) return;

    const url = new URL(details.url);

    // Vérifier si c'est un site supporté
    if (!isSupportedSite(url.hostname)) return;

    // Éviter les doubles traitements
    if (processingUrls.has(details.url)) return;
    processingUrls.add(details.url);

    try {
      const backendUrl = await getBackendUrl();

      // Vérifier si le backend est accessible
      const healthCheck = await fetch(`${backendUrl}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });

      if (!healthCheck.ok) {
        throw new Error("Backend non disponible");
      }

      // Scraper et sauvegarder
      const result = await scrapeAndSave(details.url);

      // Rediriger vers la page de l'extension
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`index.html#/recipe/${result.recipeId}`),
      });
    } catch (error) {
      // Fallback vers le site original
      console.log("Reciper: Fallback -", error.message);
    } finally {
      setTimeout(() => {
        processingUrls.delete(details.url);
      }, 5000);
    }
  },
  {
    url: [{ schemes: ["http", "https"] }],
  }
);

/**
 * Gestionnaire de messages (pour le popup)
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SCRAPE_AND_SAVE") {
    scrapeAndSave(message.url)
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({ success: false, error: error.message })
      );
    return true; // Indique une réponse asynchrone
  }

  if (message.type === "GET_BACKEND_URL") {
    getBackendUrl().then((url) => sendResponse({ url }));
    return true;
  }
});

// Log au démarrage
console.log("Reciper: Extension chargée - 606 sites supportés");
