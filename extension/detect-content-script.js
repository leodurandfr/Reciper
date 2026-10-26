// Content script injecté sur les sites absents de la liste recipe-scrapers, quand l'option
// « Récupérer les recettes sur tous les sites » est activée. S'exécute une fois le HTML chargé
// (document_end) : si la page déclare une recette schema.org, il envoie son HTML au service
// worker, qui vérifie et ouvre la recette dans Reciper.

(() => {
  // Retour arrière / avant (par exemple depuis Reciper) : laisser la page telle quelle
  if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;

  // Pré-filtre rapide ; la vérification complète est faite par le service worker
  const hasJsonLdRecipe = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .some((script) => script.textContent.includes('Recipe'));
  const hasMicrodataRecipe = document.querySelector('[itemtype*="schema.org/Recipe" i]') !== null;
  if (!hasJsonLdRecipe && !hasMicrodataRecipe) return;

  chrome.runtime.sendMessage({
    type: 'RECIPE_PAGE_DETECTED',
    url: location.href,
    html: document.documentElement.outerHTML,
  }).catch(() => {});
})();
