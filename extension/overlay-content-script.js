// Content script injecté à document_start sur les sites de recettes supportés.
// S'exécute de manière synchrone AVANT tout parsing HTML / rendu,
// ce qui masque la page sous un overlay #F2EEE5 sans aucun flash.

const overlay = document.createElement('div');
overlay.id = '__reciper_overlay';
overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#F2EEE5;';
document.documentElement.appendChild(overlay);

// Le service worker envoie REMOVE_OVERLAY si la page n'est pas une recette
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'REMOVE_OVERLAY') {
    document.getElementById('__reciper_overlay')?.remove();
  }
});

// Sécurité : auto-retrait après 5s si le service worker ne répond pas
setTimeout(() => {
  document.getElementById('__reciper_overlay')?.remove();
}, 5000);
