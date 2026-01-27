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
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  padding: var(--space-04) var(--space-06);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  color: white;
  text-decoration: none;
}

.logo:hover {
  color: #3498db;
}

:deep(.header-btn) {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: var(--space-02);
  display: flex;
  align-items: center;
  gap: var(--space-02);
}

:deep(.header-btn:hover) {
  color: #3498db;
}
</style>
