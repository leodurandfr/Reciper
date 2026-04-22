import { createI18n } from 'vue-i18n'
import fr from './locales/fr.js'
import en from './locales/en.js'
import es from './locales/es.js'
import pt from './locales/pt.js'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  messages: { fr, en, es, pt },
})

export default i18n
