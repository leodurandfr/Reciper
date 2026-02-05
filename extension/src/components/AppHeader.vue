<template>
  <header class="app-header" :class="{ 'app-header--separator': largeTitle }">
    <div class="header-left" id="header-left">
      <slot name="left"></slot>
    </div>
    <router-link to="/favorites" class="logo" :class="{ 'logo--large': largeTitle }">Reciper</router-link>
    <div class="header-right" id="header-right">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<script setup>
defineProps({
  largeTitle: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.app-header {
  grid-column: 2 / 12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-04) 0;
  border-bottom: 2px solid transparent;
  transition: border-bottom-color var(--transition-normal);
}

.app-header--separator {
  grid-column: 1 / -1;
  border-bottom-color: var(--color-border);
}

.header-left,
.header-right {
  flex: 1;
  min-height: 40px;
  display: flex;
  align-items: center;
  transition: opacity var(--transition-fast);
}

.app-header--separator .header-left,
.app-header--separator .header-right {
  opacity: 0;
  pointer-events: none;
}

.header-left :deep(> *),
.header-right :deep(> *) {
  animation: header-btn-in var(--transition-fast) ease;
}

@keyframes header-btn-in {
  from { opacity: 0; }
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
  font-family: var(--font-family-heading);
  font-size: var(--font-size-heading-02);
  line-height: 1;
  font-weight: 600;
  transition: opacity var(--transition-fast), font-size var(--transition-normal);
}

.logo:hover {
  opacity: 0.8;
}

.logo--large {
  font-size: 72px;
}

@media (max-width: 1024px) {
  .app-header {
    grid-column: 1 / 13;
  }

  .logo--large {
    font-size: 48px;
  }
}

@media (max-width: 480px) {
  .app-header {
    grid-column: 1 / -1;
  }

  .logo--large {
    font-size: 32px;
  }
}
</style>
