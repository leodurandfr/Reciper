/**
 * Document offscreen : héberge le Web Worker Pyodide (pyodide-worker.js) et relaie
 * les demandes de scraping du service worker (qui ne peut pas créer de worker lui-même).
 * Créé par le service worker, il reste ouvert pour garder Python chargé en mémoire.
 */

// Démarré tout de suite : Pyodide se charge pendant que la page de chargement s'ouvre
const worker = new Worker("pyodide-worker.js", { type: "module" });

const pendingRequests = new Map();
let nextRequestId = 1;

worker.onmessage = ({ data }) => {
  const sendResponse = pendingRequests.get(data.id);
  pendingRequests.delete(data.id);
  sendResponse?.(data.success ? { success: true, recipe: data.recipe } : { success: false, error: data.error });
};

worker.onerror = (event) => {
  // Erreur de chargement du worker : faire échouer les demandes en attente
  for (const sendResponse of pendingRequests.values()) {
    sendResponse({ success: false, error: event.message || "Pyodide worker error" });
  }
  pendingRequests.clear();
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== "offscreen") return;

  if (message.type === "SCRAPE_HTML") {
    const id = nextRequestId++;
    pendingRequests.set(id, sendResponse);
    worker.postMessage({ id, html: message.html, url: message.url });
    return true;
  }
});
