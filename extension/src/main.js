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
import { initTheme, getSettings } from './stores/settings.js'

// Initialiser le thème
initTheme()

// Charger la langue persistée
getSettings().then(settings => {
  if (settings.language && i18n.global.availableLocales.includes(settings.language)) {
    i18n.global.locale.value = settings.language
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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

const app = createApp(App)
app.use(i18n)
app.use(router)
app.mount('#app')
