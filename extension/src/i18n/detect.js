const SUPPORTED = ['en', 'fr', 'es', 'pt']

export function detectBrowserLocale() {
  const raw = (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage?.())
    || navigator.language || 'en'
  const base = raw.toLowerCase().split('-')[0]
  return SUPPORTED.includes(base) ? base : 'en'
}
