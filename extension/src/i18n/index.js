import { createI18n } from 'vue-i18n'
import fr from './locales/fr.js'
import en from './locales/en.js'
import es from './locales/es.js'
import pt from './locales/pt.js'
import { detectBrowserLocale } from './detect.js'

const i18n = createI18n({
  legacy: false,
  // Langue du navigateur dès le départ ; main.js applique ensuite le choix de l'utilisateur avant le montage
  locale: detectBrowserLocale(),
  fallbackLocale: 'en',
  messages: { fr, en, es, pt },
})

export default i18n
