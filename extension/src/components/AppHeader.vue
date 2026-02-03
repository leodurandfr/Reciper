<template>
  <header class="app-header">
    <div class="header-left" id="header-left">
      <slot name="left"></slot>
    </div>
    <router-link to="/favorites" class="logo heading-02">Recipper</router-link>
    <div class="header-right" id="header-right">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.app-header {
  grid-column: 2 / 12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-04) 0;
}

.header-left,
.header-right {
  min-width: 80px;
  height: 40px;
  display: flex;
  align-items: center;
}

.header-left {
  display: flex;
  justify-content: flex-start;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.logo {
  color: var(--color-brand);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 0.8;
}

:deep(.header-btn) {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: var(--space-02);
  display: flex;
  align-items: center;
  gap: var(--space-02);
  transition: opacity var(--transition-fast);
}

:deep(.header-btn:hover) {
  opacity: 0.8;
}

@media (max-width: 1024px) {
  .app-header {
    grid-column: 1 / 13;
  }
}

@media (max-width: 480px) {
  .app-header {
    grid-column: 1 / -1;
  }
}
</style>
