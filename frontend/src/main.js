// Styles globaux
import './assets/styles/variables.css'
import './assets/styles/typography.css'
import './assets/styles/base.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import RecipeView from './views/RecipeView.vue'
import StyleGuideView from './views/StyleGuideView.vue'

const routes = [
  { path: '/', redirect: '/favorites' },
  { path: '/favorites', component: HomeView, props: { favoritesOnly: true } },
  { path: '/history', component: HomeView, props: { favoritesOnly: false } },
  { path: '/recipe/:id', component: RecipeView, props: true },
  { path: '/style-guide', component: StyleGuideView },
]

const router = createRouter({
  history: createWebHistory(),
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
