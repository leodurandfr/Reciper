<template>
  <AppHeader />
  <main>
    <router-view />
  </main>

  <!-- Grid overlay for development -->
  <div v-if="showGrid" class="grid-overlay">
    <div v-for="i in gridColumns" :key="i" class="grid-column"></div>
  </div>
  <!-- Dev tools -->
  <div class="dev-tools">
    <button class="dev-toggle" @click="toggleTheme">
      {{ isDark ? 'Light' : 'Dark' }}
    </button>
    <button class="dev-toggle" @click="showGrid = !showGrid">
      {{ showGrid ? 'Masquer' : 'Grille' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AppHeader from './components/AppHeader.vue'

const showGrid = ref(false)
const isDark = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

// Nombre de colonnes selon le breakpoint
const gridColumns = computed(() => {
  return windowWidth.value <= 480 ? 4 : 12
})

function handleResize() {
  windowWidth.value = window.innerWidth
}

// Initialiser le thème depuis localStorage ou préférence système
onMounted(() => {
  window.addEventListener('resize', handleResize)

  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
    document.documentElement.setAttribute('data-theme', saved)
  } else {
    // Détecter la préférence système
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}
</script>

<style>
/* Layout principal - grille 12 colonnes */
#app {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gutter);
  align-content: start;
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 var(--grid-margin);
}

main {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  padding: var(--space-06) 0;
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

/* Legacy support (pour compatibilité) */
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

/* Boutons */
.btn-primary {
  background-color: var(--color-brand);
  color: var(--color-text-contrast);
  padding: var(--space-03) var(--space-05);
  border-radius: var(--radius-01);
  transition: background-color var(--transition-fast);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-brand-hover);
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-text-contrast);
  padding: var(--space-03) var(--space-05);
  border-radius: var(--radius-01);
  transition: background-color var(--transition-fast);
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

/* Inputs */
input[type="text"],
input[type="url"] {
  padding: var(--space-03);
  border: 1px solid var(--color-border-strong);
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

/* Grid overlay (dev) */
.grid-overlay {
  position: fixed;
  top: 0;
  left: var(--grid-margin);
  right: var(--grid-margin);
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gutter);
  pointer-events: none;
  z-index: 9998;
}

.grid-column {
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 1px solid rgba(255, 0, 0, 0.3);
  border-right: 1px solid rgba(255, 0, 0, 0.3);
}

/* Dev tools */
.dev-tools {
  position: fixed;
  bottom: var(--space-04);
  right: var(--space-04);
  z-index: 9999;
  display: flex;
  gap: var(--space-02);
}

.dev-toggle {
  background-color: var(--color-background-contrast);
  color: var(--color-text-contrast);
  font-size: var(--font-size-body-small);
  padding: var(--space-02) var(--space-03);
  border-radius: var(--radius-01);
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.dev-toggle:hover {
  opacity: 1;
}

/* Responsive - Tablet (lg/md: 480-1280px) */
@media (max-width: 1280px) {
  #app {
    grid-template-columns: repeat(12, 1fr);
    padding: 0 var(--grid-margin);
    gap: var(--grid-gutter);
  }

  .grid-overlay {
    left: var(--grid-margin);
    right: var(--grid-margin);
    grid-template-columns: repeat(12, 1fr);
    gap: var(--grid-gutter);
  }
}

/* Responsive - Mobile */
@media (max-width: 480px) {
  #app {
    grid-template-columns: repeat(4, 1fr);
    padding: 0 var(--grid-margin);
    gap: var(--grid-gutter);
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

  .grid-overlay {
    left: var(--grid-margin);
    right: var(--grid-margin);
    grid-template-columns: repeat(4, 1fr);
    gap: var(--grid-gutter);
  }
}
</style>
