import { isSupportedSite } from "./supported-sites.js";

const API_BASE = "http://localhost:4827";
const FRONTEND_BASE = "http://localhost:6391";

// Set pour tracker les URLs en cours de traitement (éviter les doubles)
const processingUrls = new Set();

/**
 * Intercepte les navigations vers les sites de recettes supportés
 */
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    // Ignorer les iframes et sous-frames
    if (details.frameId !== 0) return;

    const url = new URL(details.url);

    // Vérifier si c'est un site de recette supporté
    if (!isSupportedSite(url.hostname)) return;

    // Éviter de traiter la même URL plusieurs fois
    if (processingUrls.has(details.url)) return;

    processingUrls.add(details.url);

    try {
      // Vérifier si le backend est accessible
      const healthCheck = await fetch(`${API_BASE}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });

      if (!healthCheck.ok) {
        throw new Error("Backend non disponible");
      }

      // Envoyer l'URL au backend pour scraping
      const response = await fetch(`${API_BASE}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: details.url }),
      });

      if (response.ok) {
        const recipe = await response.json();
        // Rediriger vers l'app locale avec la recette
        chrome.tabs.update(details.tabId, {
          url: `${FRONTEND_BASE}/recipe/${recipe.id}`,
        });
      } else {
        // Erreur API (site non supporté, etc.) - laisser la navigation normale
        console.log("RecettesScrapper: Erreur API", await response.text());
      }
    } catch (error) {
      // Backend non accessible - fallback vers le site original
      console.log("RecettesScrapper: Fallback vers site original", error.message);
    } finally {
      // Nettoyer après un délai
      setTimeout(() => {
        processingUrls.delete(details.url);
      }, 5000);
    }
  },
  {
    url: [{ schemes: ["http", "https"] }],
  }
);

// Log au démarrage
console.log("RecettesScrapper: Extension chargée - 606 sites supportés");
