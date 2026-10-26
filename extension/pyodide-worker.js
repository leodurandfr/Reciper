/**
 * Web Worker : exécute recipe-scrapers (Python) via Pyodide.
 * Lancé par offscreen.js ; tourne sur son propre thread pour ne pas bloquer
 * les pages de l'extension (qui partagent le thread du document offscreen).
 */

import { loadPyodide } from "./pyodide/pyodide.mjs";

const PYTHON_ROOT = "/home/pyodide/reciper_src";
const extensionRoot = new URL("./", self.location.href).href;

/**
 * Charge Pyodide, les wheels embarquées et le code Python de Reciper.
 * Retourne la fonction Python scrape_recipe_json.
 */
async function initPython() {
  const indexURL = `${extensionRoot}pyodide/`;
  const pyodide = await loadPyodide({ indexURL });

  const wheels = await fetch(indexURL + "wheels.json").then((r) => r.json());
  await pyodide.loadPackage(wheels.map((wheel) => indexURL + wheel), {
    messageCallback: () => {},
  });

  const files = await fetch(`${extensionRoot}python/files.json`).then((r) => r.json());
  const sources = await Promise.all(
    files.map((path) => fetch(`${extensionRoot}python/${path}`).then((r) => r.text()))
  );
  files.forEach((path, i) => {
    const target = `${PYTHON_ROOT}/${path}`;
    pyodide.FS.mkdirTree(target.slice(0, target.lastIndexOf("/")));
    pyodide.FS.writeFile(target, sources[i]);
  });

  pyodide.runPython(`import sys; sys.path.insert(0, "${PYTHON_ROOT}")`);
  return pyodide.pyimport("reciper.scraper").scrape_recipe_json;
}

// Chargement lancé dès le démarrage du worker, pour être prêt au premier scraping
const scraperReady = initPython();

async function scrape(html, url) {
  let scrapeRecipeJson;
  try {
    scrapeRecipeJson = await scraperReady;
  } catch (error) {
    // Échec définitif pour ce worker : le service worker recrée le document offscreen
    throw Object.assign(new Error(`Échec du chargement de Python: ${error.message}`), { fatal: true });
  }
  try {
    return JSON.parse(scrapeRecipeJson(html, url));
  } catch (error) {
    // PythonError : ne garder que le message de l'exception, pas la traceback
    if (error.type === "UnsupportedWebsiteError") {
      throw new Error(`Site non supporté: ${url}`);
    }
    const lastLine = String(error.message).trim().split("\n").pop();
    throw new Error(`Erreur de scraping: ${lastLine}`);
  }
}

self.onmessage = async ({ data }) => {
  try {
    const recipe = await scrape(data.html, data.url);
    self.postMessage({ id: data.id, success: true, recipe });
  } catch (error) {
    self.postMessage({ id: data.id, success: false, error: error.message, fatal: Boolean(error.fatal) });
  }
};
