// Styles globaux
import './assets/styles/variables.css'
import './assets/styles/typography.css'
import './assets/styles/base.css'

import { createApp, watch } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import RecipeView from './views/RecipeView.vue'
import LoadingView from './views/LoadingView.vue'
import i18n from './i18n/index.js'
import { initTheme, getEffectiveLanguage } from './stores/settings.js'
import { useScrollPosition } from './composables/useScrollPosition.js'

const routes = [
  { path: '/', redirect: '/favorites' },
  { path: '/favorites', component: HomeView, props: { favoritesOnly: true } },
  { path: '/history', component: HomeView, props: { favoritesOnly: false } },
  { path: '/recipe/:id', component: RecipeView },
  { path: '/loading', component: LoadingView },
]

// Utiliser createWebHashHistory pour les extensions Chrome
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // Scroll is handled manually via useScrollPosition for smooth transitions
})

// Scroll position management
const { savePosition, markForRestore } = useScrollPosition()

// Disable browser's native scroll restoration (we handle it manually after transitions)
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

// Save scroll position before leaving a route
router.beforeEach((to, from) => {
  // Save current scroll position for the route we're leaving
  if (from.path) {
    savePosition(from.path)
  }
})

// Detect back/forward navigation to restore scroll
window.addEventListener('popstate', () => {
  markForRestore()
})

const app = createApp(App)
app.use(i18n)
app.use(router)

// L'attribut lang suit la langue de l'interface (index.html démarre à lang="fr")
watch(i18n.global.locale, (language) => {
  document.documentElement.lang = language
}, { immediate: true })

// Appliquer le thème et la langue (utilisateur ou détectée) avant le montage, pour éviter un flash
Promise.all([
  initTheme(),
  getEffectiveLanguage().then(language => {
    if (i18n.global.availableLocales.includes(language)) {
      i18n.global.locale.value = language
    }
  }),
])
  .catch(error => console.error('Erreur initialisation thème/langue:', error))
  .finally(() => app.mount('#app'))
