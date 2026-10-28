// Généré au build par scripts/vendor-pyodide.mjs depuis recipe_scrapers.SCRAPERS
import { SUPPORTED_SITES } from "./supported-sites.js";
import { initLocale, t } from "./i18n-lite.js";
import { createRecipeStore } from "./recipe-store.js";

// Pages en cours de traitement, clé « tabId url » (voir processingKey)
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

// Domaines généralistes de la liste recipe-scrapers : seules les pages sous ce chemin sont
// interceptées. Sinon chaque article serait masqué par l'overlay le temps de le retélécharger.
const SUPPORTED_SITE_PATHS = {
  "bbc.co.uk": "/food/",
  "bbc.com": "/food/",
  "theguardian.com": "/food/",
};

/**
 * Vérifie si une URL correspond à un site supporté (même règle que recipe-scrapers :
 * le domaine exact, avec ou sans « www. », plus le chemin pour les domaines généralistes)
 * @param {URL} url - L'URL à vérifier (ex: https://www.marmiton.org/recettes/…)
 * @returns {boolean}
 */
function isSupportedSite(url) {
  const domain = url.hostname.replace(/^www\./, "");
  if (!SUPPORTED_SITES.has(domain)) return false;
  const path = SUPPORTED_SITE_PATHS[domain];
  return !path || url.pathname.startsWith(path);
}

/**
 * Motifs des sites supportés pour les content scripts (mêmes règles que isSupportedSite)
 */
function supportedSitePatterns() {
  const patterns = [];
  for (const domain of SUPPORTED_SITES) {
    const path = SUPPORTED_SITE_PATHS[domain] ?? "/";
    patterns.push(`*://${domain}${path}*`);
    patterns.push(`*://www.${domain}${path}*`);
  }
  return patterns;
}

/**
 * Clé de processingUrls : une même URL peut être traitée dans deux onglets à la fois
 */
function processingKey(tabId, url) {
  return `${tabId} ${url}`;
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

// Stockage des recettes (implémentation partagée avec l'app). addRecipe passe par une
// file d'écriture : deux scrapings simultanés ne peuvent pas obtenir le même id.
const { getRecipeByUrl, addRecipe } = createRecipeStore(chrome.storage.local);

// Langue des messages (réglage de l'app, sinon celle du navigateur) ; rechargée quand
// les réglages changent
let localeReady = initLocale();

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
 * Erreur affichée telle quelle par la page de chargement : message traduit (i18n-lite.js)
 * suivi du détail technique éventuel
 */
function localizedError(code, detail) {
  return new Error(detail ? `${t(code)}: ${detail}` : t(code));
}

/**
 * Fetch le HTML d'une URL
 */
async function fetchPageHtml(url) {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (error) {
    throw localizedError("fetchFailed", error.message);
  }
  if (!response.ok) {
    throw localizedError("fetchFailed", `HTTP ${response.status}`);
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
  const isRecipe = containsRecipe(html);
  // Charger Python dès maintenant (premier démarrage de plusieurs secondes),
  // seulement pour une recette : Pyodide occupe plusieurs dizaines de Mo
  if (isRecipe) ensureOffscreenDocument().catch(() => {});
  return isRecipe;
}

/**
 * Lance le pre-fetch de détection d'une page, consommé par onCommitted
 */
function startRecipeCheck(url) {
  const check = fetchAndCheckRecipe(url);
  pendingRecipeChecks.set(url, check);
  // Jamais consommé (redirection, navigation annulée) : l'oublier
  setTimeout(() => {
    if (pendingRecipeChecks.get(url) === check) pendingRecipeChecks.delete(url);
  }, PAGE_HTML_TTL_MS);
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
        () => resolve({ success: false, errorCode: "scrapeTimeout", fatal: true }),
        SCRAPE_TIMEOUT_MS
      );
    });
    const response = await Promise.race([
      sendToOffscreen({ target: "offscreen", type: "SCRAPE_HTML", url, html }),
      timeout,
    ]).finally(() => clearTimeout(timeoutId));

    if (!response?.success) {
      // Python n'a pas pu se charger, ou le worker est bloqué / planté : repartir de zéro
      // au prochain scraping plutôt que de réutiliser un document cassé. Pas pendant
      // d'autres scrapings : le dernier à échouer s'en charge.
      if (response?.fatal && scrapesInFlight === 1) closeOffscreenDocument().catch(() => {});
      throw localizedError(response?.errorCode || "error", response?.errorDetail);
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
  // Langue des messages d'erreur et du titre par défaut
  await localeReady;

  // Vérifier si la recette existe déjà
  const existing = await getRecipeByUrl(url);
  if (existing) {
    return { success: true, recipeId: existing.id, existing: true };
  }

  // Scraper localement (Pyodide)
  const scrapedRecipe = await scrapeRecipe(url);
  if (!scrapedRecipe.title) scrapedRecipe.title = t("untitledRecipe");

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

// Les réglages ont changé : langue, et (dés)activation du script de détection
// si l'option « tous les sites » a changé
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.settings) return;
  localeReady = initLocale();
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
  const key = processingKey(tabId, url);
  if (processingUrls.has(key) || !containsRecipe(html)) return;
  processingUrls.add(key);

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
    processingUrls.delete(key);
  }
}

/**
 * Retire l'overlay injecté par le content script. Celui-ci (document_start) peut ne pas
 * encore écouter quand onCommitted arrive : réessayer brièvement, comme sendToOffscreen.
 * Le message vise le document de la navigation, pas une page chargée depuis dans l'onglet.
 */
async function removeOverlay({ tabId, documentId }) {
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await chrome.tabs.sendMessage(tabId, { type: "REMOVE_OVERLAY" }, documentId ? { documentId } : {});
      return;
    } catch (error) {
      if (!String(error.message).includes("Receiving end does not exist")) return;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}

/**
 * Capture l'URL de la page précédente et lance le pre-fetch de détection recipe
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = new URL(details.url);
  if (!/^https?:$/.test(url.protocol)) return;
  // Retour au site depuis Reciper : la page ne sera pas interceptée
  if (bypassUrls.has(details.url)) return;

  // Même URL que l'onglet : rechargement, ignoré par onCommitted
  const tab = await chrome.tabs.get(details.tabId).catch(() => null);
  const isReload = tab?.url === details.url;

  if (isSupportedSite(url)) {
    // Lancer le pre-fetch tout de suite, pour détecter @type: Recipe avant onCommitted
    // (pas pour un rechargement : il retéléchargerait la page et chargerait Pyodide pour rien)
    if (!isReload) startRecipeCheck(details.url);
  } else if (!(await isScrapeAnySiteEnabled())) {
    // Sites non supportés : la détection se fait sur la page chargée (detect-content-script.js)
    return;
  }

  // Capturer l'URL de la page précédente (pas lors d'un rechargement : la page serait
  // sa propre « page précédente », et le retour au site ramènerait dans Reciper)
  if (tab?.url && !isReload) {
    preNavigationUrls.set(details.tabId, tab.url);
  } else {
    preNavigationUrls.delete(details.tabId);
  }
});

/**
 * Intercepte les navigations vers les sites de recettes supportés.
 * L'overlay est déjà injecté par le content script (document_start).
 * Ici on vérifie si c'est une recette, et on retire l'overlay sinon.
 */
chrome.webNavigation.onCommitted.addListener(
  async (details) => {
    if (details.frameId !== 0) return;

    const url = new URL(details.url);
    const supported = isSupportedSite(url);

    // Pre-fetch lancé par onBeforeNavigate : consommé ici, ou abandonné
    const pendingCheck = pendingRecipeChecks.get(details.url);
    pendingRecipeChecks.delete(details.url);

    // Bypass si demandé (retour depuis Reciper vers le site)
    bypassedTabUrls.delete(details.tabId);
    if (bypassUrls.has(details.url)) {
      bypassUrls.delete(details.url);
      if (supported) {
        removeOverlay(details);
      } else {
        // Consommé plus tard par handleDetectedRecipePage (option « tous les sites »)
        bypassedTabUrls.set(details.tabId, details.url);
      }
      return;
    }
    if (!supported) return;

    // Bypass les navigations back/forward du navigateur (filet de sécurité pour les cas
    // cross-origin où replaceState ne fonctionne pas) et les rechargements : la page
    // affichée a déjà été laissée au site (bypass, retour arrière…)
    if (details.transitionQualifiers?.includes("forward_back") || details.transitionType === "reload") {
      removeOverlay(details);
      return;
    }

    // Éviter les doubles traitements (le premier ouvrira Reciper si c'est une recette)
    const key = processingKey(details.tabId, details.url);
    if (processingUrls.has(key)) {
      removeOverlay(details);
      return;
    }
    processingUrls.add(key);

    try {
      // Consommer le pre-fetch lancé par onBeforeNavigate (ou fallback)
      const isRecipe = await (pendingCheck ?? fetchAndCheckRecipe(details.url));

      if (!isRecipe) {
        // Pas une recette : retirer l'overlay injecté par le content script
        removeOverlay(details);
        return;
      }

      // Vérifier que l'onglet est toujours sur la même page
      const tab = await chrome.tabs.get(details.tabId).catch(() => null);
      if (!tab || tab.url !== details.url) {
        removeOverlay(details);
        return;
      }

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
      removeOverlay(details);
    } finally {
      processingUrls.delete(key);
    }
  },
  {
    url: [{ schemes: ["http", "https"] }],
  }
);

/**
 * Gestionnaire de messages (page de chargement, document offscreen, content scripts)
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
    return;
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

// Log au démarrage, une fois la locale chargée
localeReady.then(() => {
  console.log(t("extensionLoaded").replace("{count}", SUPPORTED_SITES.size));
});
