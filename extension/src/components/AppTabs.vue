<template>
  <nav class="app-tabs">
    <BaseButton
      v-for="tab in tabs"
      :key="tab.to"
      tag="router-link"
      :to="tab.to"
      :variant="route.path === tab.to ? 'fill' : 'outline'"
    >
      {{ $t(tab.labelKey) }}
    </BaseButton>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import BaseButton from './BaseButton.vue'

const route = useRoute()

const tabs = [
  { to: '/favorites', labelKey: 'tabs.favorites' },
  { to: '/history', labelKey: 'tabs.history' }
]
</script>

<style scoped>
.app-tabs {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: var(--space-02);
  margin-bottom: var(--space-05);
  padding-top: var(--space-05);
}
</style>
