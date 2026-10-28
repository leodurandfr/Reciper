/**
 * Document offscreen : héberge le Web Worker Pyodide (pyodide-worker.js) et relaie
 * les demandes de scraping du service worker (qui ne peut pas créer de worker lui-même).
 * Il garde Python chargé entre deux recettes, puis demande sa fermeture après
 * une période d'inactivité pour libérer la mémoire.
 */

const IDLE_CLOSE_MS = 5 * 60 * 1000;

const pendingRequests = new Map();
let nextRequestId = 1;
let idleTimer = null;

// Démarré tout de suite : Pyodide se charge pendant que la page de chargement s'ouvre.
// Recréé à la demande suivante s'il a planté.
let worker = createWorker();

function scheduleIdleClose() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (pendingRequests.size > 0) {
      scheduleIdleClose();
      return;
    }
    // Seul le service worker peut fermer le document offscreen
    chrome.runtime.sendMessage({ type: "OFFSCREEN_IDLE" }).catch(() => {});
  }, IDLE_CLOSE_MS);
}

function createWorker() {
  const newWorker = new Worker("pyodide-worker.js", { type: "module" });

  newWorker.onmessage = ({ data }) => {
    const sendResponse = pendingRequests.get(data.id);
    pendingRequests.delete(data.id);
    sendResponse?.(
      data.success
        ? { success: true, recipe: data.recipe }
        : { success: false, errorCode: data.errorCode, errorDetail: data.errorDetail, fatal: data.fatal }
    );
    // Pyodide inutilisable : les autres demandes n'aboutiront pas non plus
    if (!data.success && data.fatal) discardWorker(data.errorDetail);
    scheduleIdleClose();
  };

  // Erreur de chargement ou plantage du worker : faire échouer les demandes en attente
  newWorker.onerror = (event) => discardWorker(event.message || "Pyodide worker error");
  newWorker.onmessageerror = () => discardWorker("Pyodide worker message error");
  return newWorker;
}

/**
 * Abandonne le worker (et ses demandes en attente) : le suivant est créé à la prochaine demande
 */
function discardWorker(errorDetail) {
  for (const sendResponse of pendingRequests.values()) {
    sendResponse({ success: false, errorCode: "scrapeFailed", errorDetail, fatal: true });
  }
  pendingRequests.clear();
  worker?.terminate();
  worker = null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== "offscreen") return;

  if (message.type === "SCRAPE_HTML") {
    const id = nextRequestId++;
    pendingRequests.set(id, sendResponse);
    worker ??= createWorker();
    worker.postMessage({ id, html: message.html, url: message.url });
    scheduleIdleClose();
    return true;
  }
});

scheduleIdleClose();
