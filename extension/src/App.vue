<template>
  <AppHeader>
    <template #right>
      <router-link to="/settings" class="settings-link" title="Paramètres">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </router-link>
    </template>
  </AppHeader>
  <main>
    <router-view />
  </main>

  <!-- Debug Grid Toggle -->
  <button @click="toggleGrid" class="grid-toggle" :class="{ active: showGrid }" title="Toggle Grid Overlay">
    {{ showGrid ? '⊞' : '⊡' }}
  </button>
  <div v-if="showGrid" class="grid-overlay">
    <div class="grid-container">
      <div v-for="i in 12" :key="i" class="grid-column">
        <span class="column-number">{{ i }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'

const showGrid = ref(false)

function toggleGrid() {
  showGrid.value = !showGrid.value
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
  background-color: var(--color-brand);
  color: var(--color-text-contrast);
  padding: var(--space-03) var(--space-05);
  border-radius: var(--radius-01);
  transition: background-color var(--transition-fast);
}

.btn-danger:hover:not(:disabled) {
  background-color: var(--color-brand-hover);
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

/* Settings link */
.settings-link {
  color: var(--color-text-contrast);
  opacity: 0.8;
  transition: opacity var(--transition-fast);
  display: flex;
  align-items: center;
}

.settings-link:hover {
  opacity: 1;
}

/* Grid Toggle Button (Debug) */
.grid-toggle {
  position: fixed;
  bottom: var(--space-04);
  right: var(--space-04);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-brand);
  color: var(--color-text-contrast);
  border: none;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  transition: all var(--transition-fast);
}

.grid-toggle:hover {
  transform: scale(1.1);
}

.grid-toggle.active {
  background: var(--color-brand-hover);
}

/* Grid Overlay (Debug) */
.grid-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gutter);
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 var(--grid-margin);
}

.grid-column {
  background: rgba(255, 85, 0, 0.1);
  border: 1px solid var(--color-brand);
  position: relative;
}

.column-number {
  position: absolute;
  top: var(--space-02);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-brand);
  color: var(--color-text-contrast);
  padding: var(--space-01) var(--space-02);
  border-radius: var(--radius-01);
  font-size: 12px;
  font-weight: 600;
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  #app {
    grid-template-columns: repeat(12, 1fr);
    padding: 0 var(--grid-margin);
    gap: var(--grid-gutter);
  }

  .grid-container {
    grid-template-columns: repeat(12, 1fr);
    gap: var(--grid-gutter);
    padding: 0 var(--grid-margin);
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

  .grid-container {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--grid-gutter);
    padding: 0 var(--grid-margin);
  }

  /* Masquer les colonnes 5-12 en mobile */
  .grid-column:nth-child(n+5) {
    display: none;
  }
}
</style>
