// Styles globaux
import './assets/styles/variables.css'
import './assets/styles/typography.css'
import './assets/styles/base.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import RecipeView from './views/RecipeView.vue'
import SettingsView from './views/SettingsView.vue'
import LoadingView from './views/LoadingView.vue'
import { initDB } from './services/db.js'
import { initTheme } from './stores/settings.js'

// Initialiser IndexedDB
initDB().catch(console.error)

// Initialiser le thème
initTheme()

const routes = [
  { path: '/', redirect: '/favorites' },
  { path: '/favorites', component: HomeView, props: { favoritesOnly: true } },
  { path: '/history', component: HomeView, props: { favoritesOnly: false } },
  { path: '/recipe/:id', component: RecipeView, props: true },
  { path: '/settings', component: SettingsView },
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
app.use(router)
app.mount('#app')
