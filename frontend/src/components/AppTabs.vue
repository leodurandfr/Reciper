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
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.tab-btn:hover {
  background: #ebf5fb;
}

.tab-btn.active {
  background: #3498db;
  color: white;
}
</style>
