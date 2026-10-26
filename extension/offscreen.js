/**
 * Document offscreen : héberge le Web Worker Pyodide (pyodide-worker.js) et relaie
 * les demandes de scraping du service worker (qui ne peut pas créer de worker lui-même).
 * Il garde Python chargé entre deux recettes, puis demande sa fermeture après
 * une période d'inactivité pour libérer la mémoire.
 */

const IDLE_CLOSE_MS = 5 * 60 * 1000;

// Démarré tout de suite : Pyodide se charge pendant que la page de chargement s'ouvre
const worker = new Worker("pyodide-worker.js", { type: "module" });

const pendingRequests = new Map();
let nextRequestId = 1;
let idleTimer = null;

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

function failPendingRequests(error) {
  for (const sendResponse of pendingRequests.values()) {
    sendResponse({ success: false, error, fatal: true });
  }
  pendingRequests.clear();
}

worker.onmessage = ({ data }) => {
  const sendResponse = pendingRequests.get(data.id);
  pendingRequests.delete(data.id);
  sendResponse?.(
    data.success
      ? { success: true, recipe: data.recipe }
      : { success: false, error: data.error, fatal: data.fatal }
  );
  scheduleIdleClose();
};

// Erreur de chargement ou plantage du worker : faire échouer les demandes en attente
worker.onerror = (event) => failPendingRequests(event.message || "Pyodide worker error");
worker.onmessageerror = () => failPendingRequests("Pyodide worker message error");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== "offscreen") return;

  if (message.type === "SCRAPE_HTML") {
    const id = nextRequestId++;
    pendingRequests.set(id, sendResponse);
    worker.postMessage({ id, html: message.html, url: message.url });
    scheduleIdleClose();
    return true;
  }
});

scheduleIdleClose();
