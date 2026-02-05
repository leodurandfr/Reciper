<template>
  <footer class="app-footer body-small" :class="{ 'app-footer--inset': inset }">
    <router-link to="/settings" class="footer-link">Paramètres</router-link>
    <span class="footer-separator">·</span>
    <a href="https://www.leodurand.com" target="_blank" rel="noopener" class="footer-link">
      Reciper par leodurand.com
    </a>
  </footer>
</template>

<script setup>
defineProps({
  inset: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.app-footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-03);
  padding: var(--space-06) 0;
  margin-top: var(--space-06);
  border-top: 2px solid var(--color-border);
  color: var(--color-text-50);
}

.app-footer--inset {
  grid-column: 2 / 12;
}

@media (max-width: 480px) {
  .app-footer--inset {
    grid-column: 1 / -1;
  }
}

.footer-link {
  color: var(--color-text-50);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-brand);
}

.footer-separator {
  color: var(--color-text-50);
}
</style>
