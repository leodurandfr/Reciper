<template>
  <nav class="app-tabs">
    <div class="tabs-center">
      <BaseButton
        v-for="tab in tabs"
        :key="tab.to"
        tag="router-link"
        :to="tab.to"
        :variant="route.path === tab.to ? 'fill' : 'outline'"
      >
        {{ $t(tab.labelKey) }}
      </BaseButton>
    </div>
    <SearchButton class="tabs-search" />
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import BaseButton from './BaseButton.vue'
import SearchButton from './SearchButton.vue'

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
  align-items: center;
  gap: var(--space-02);
  margin-bottom: var(--space-05);
  padding-top: var(--space-05);
  border-top: 2px solid var(--color-border);
  position: relative;
}

.tabs-center {
  display: flex;
  gap: var(--space-02);
}

.tabs-search {
  position: absolute;
  right: 0;
}

.app-tabs :deep(.base-btn--fill) {
  pointer-events: none;
}
</style>
