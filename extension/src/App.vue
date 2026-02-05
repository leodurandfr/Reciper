<template>
  <AppHeader :large-title="isHomePage" />
  <main>
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="pageKey" />
      </Transition>
    </router-view>
  </main>
  <AppFooter :inset="isRecipePage" />

  <SettingsModal :is-open="isSettingsModalOpen" @close="closeSettings" />
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import SettingsModal from './components/SettingsModal.vue'
import { useSettingsModal } from './composables/useSettingsModal.js'

const route = useRoute()
const isRecipePage = computed(() => route.path.startsWith('/recipe/'))
const isHomePage = computed(() => route.path === '/favorites' || route.path === '/history')
const pageKey = computed(() => isHomePage.value ? 'home' : route.path)

const { isSettingsModalOpen, closeSettings } = useSettingsModal()

// Close settings modal on route change
watch(
  () => route.path,
  () => {
    if (isSettingsModalOpen.value) {
      closeSettings()
    }
  }
)

</script>

<style>
/* Layout principal - grille 12 colonnes */
#app {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto 1fr auto;
  column-gap: var(--grid-gutter);
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 var(--grid-margin);
}

main {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-content: start;
  position: relative;
}

/* Classes utilitaires pour la grille 12 colonnes */
.col-full {
  grid-column: 1 / -1;
}

/* Split 6/6 (RecipeHeader) */
.col-1-6 {
  grid-column: 1 / 7;
}

.col-7-12 {
  grid-column: 7 / -1;
}

/* Split 4/8 (RecipeDetail) */
.col-1-4 {
  grid-column: 1 / 5;
}

.col-5-12 {
  grid-column: 5 / -1;
}

/* Card spans */
.col-span-3 {
  grid-column: span 3;
}

.col-span-4 {
  grid-column: span 4;
}

/* Legacy support */
.col-5-8 {
  grid-column: 5 / 9;
}

.col-1-3 {
  grid-column: 1 / 4;
}

.col-4-8 {
  grid-column: 4 / 9;
}

.subgrid {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}

/* Inputs */
input[type="text"],
input[type="url"] {
  padding: var(--space-03);
  border: 1px solid var(--color-text);
  border-radius: var(--radius-01);
  background-color: var(--color-background-neutral);
  color: var(--color-text);
  width: 100%;
  transition: border-color var(--transition-fast);
}

input:focus {
  outline: none;
  border-color: var(--color-brand);
}

/* Page transitions — leave only (enter handled by stagger animations) */
.page-leave-active {
  transition: opacity var(--transition-fast);
}

.page-leave-to {
  opacity: 0;
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  #app {
    grid-template-columns: repeat(12, 1fr);
    padding: 0 var(--grid-margin);
  }

}

/* Responsive - Mobile */
@media (max-width: 480px) {
  #app {
    grid-template-columns: repeat(4, 1fr);
    padding: 0 var(--grid-margin);
  }

  .col-full,
  .col-1-6,
  .col-7-12,
  .col-1-4,
  .col-5-12,
  .col-5-8,
  .col-1-3,
  .col-4-8 {
    grid-column: 1 / -1;
  }

  .col-span-3,
  .col-span-4 {
    grid-column: span 4;
  }

}
</style>
