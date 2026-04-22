// Styles globaux
import './assets/styles/variables.css'
import './assets/styles/typography.css'
import './assets/styles/base.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import RecipeView from './views/RecipeView.vue'
import LoadingView from './views/LoadingView.vue'
import i18n from './i18n/index.js'
import { initTheme, getEffectiveLanguage } from './stores/settings.js'
import { useScrollPosition } from './composables/useScrollPosition.js'

// Initialiser le thème
initTheme()

// Charger la langue (utilisateur ou détectée automatiquement)
getEffectiveLanguage().then(language => {
  if (i18n.global.availableLocales.includes(language)) {
    i18n.global.locale.value = language
  }
})

const routes = [
  { path: '/', redirect: '/favorites' },
  { path: '/favorites', component: HomeView, props: { favoritesOnly: true } },
  { path: '/history', component: HomeView, props: { favoritesOnly: false } },
  { path: '/recipe/:id', component: RecipeView, props: true },
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
app.mount('#app')
