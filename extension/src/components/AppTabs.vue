<template>
  <nav class="app-tabs">
    <BaseButton
      v-for="tab in tabs"
      :key="tab.to"
      tag="router-link"
      :to="tab.to"
      :variant="route.path === tab.to ? 'fill' : 'outline'"
    >
      {{ tab.label }}
    </BaseButton>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import BaseButton from './BaseButton.vue'

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
</style>
