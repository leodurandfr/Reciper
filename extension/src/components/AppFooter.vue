<template>
  <footer class="app-footer body-small">
    <router-link to="/settings" class="footer-link">Paramètres</router-link>
    <span class="footer-separator">·</span>
    <a href="https://www.leodurand.com" target="_blank" rel="noopener" class="footer-link">
      Reciper par leodurand.com
    </a>
  </footer>
</template>

<style scoped>
.app-footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-03);
  padding: var(--space-06) 0;
  color: var(--color-text-50);
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
