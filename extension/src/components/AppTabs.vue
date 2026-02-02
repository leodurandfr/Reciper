<template>
  <nav class="app-tabs">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab-btn body-medium"
      :class="{ active: route.path === tab.to }"
    >
      {{ tab.label }}
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { to: '/favorites', label: 'Favoris' },
  { to: '/history', label: 'Historique' }
]
</script>

<style scoped>
.app-tabs {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: var(--space-02);
  margin-bottom: var(--space-05);
}

.tab-btn {
  padding: var(--space-03) var(--space-05);
  background: var(--color-background-neutral);
  color: var(--color-text);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.tab-btn:hover {
  background: var(--color-background);
}

.tab-btn.active {
  background: var(--color-brand);
  border-color: var(--color-brand);
  color: var(--color-text-contrast);
}
</style>
