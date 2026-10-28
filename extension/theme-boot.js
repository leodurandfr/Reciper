// Applique le dernier thème connu avant le premier affichage (évite un flash clair en thème
// sombre) : applyTheme (src/stores/settings.js) l'enregistre dans localStorage, la lecture de
// chrome.storage étant asynchrone. Script classique, chargé en tête de <head> (le CSP interdit l'inline).
(function () {
  var theme = null
  try {
    theme = localStorage.getItem('reciper-theme')
  } catch (e) {}
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
  }
})()
