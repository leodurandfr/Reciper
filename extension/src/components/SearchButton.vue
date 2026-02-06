<template>
  <div ref="containerRef" class="search-button" :class="{ 'search-button--open': isSearchOpen }">
    <Transition name="search-fade" mode="out-in">
      <button
        v-if="!isSearchOpen"
        key="trigger"
        class="search-trigger"
        @click="openSearch"
        :aria-label="$t('search.button')"
      >
        <Icon name="magnifying-glass" size="md" />
      </button>

      <div v-else key="field" class="search-field">
        <input
          ref="inputRef"
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="$t('search.placeholder')"
          @keydown.esc="handleClose"
        />
        <button class="search-close" @click="handleClose" :aria-label="$t('search.close')">
          <Icon name="close" size="md" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import Icon from './Icon.vue'
import { useSearch } from '../composables/useSearch.js'

const { isSearchOpen, searchQuery, openSearch, closeSearch, clearSearch } = useSearch()
const inputRef = ref(null)
const containerRef = ref(null)

// Gestion du clic extérieur
function handleClickOutside(event) {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    handleClose()
  }
}

// Auto-focus à l'ouverture + listener clic extérieur
watch(isSearchOpen, (open) => {
  if (open) {
    nextTick(() => inputRef.value?.focus())
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

// Cleanup au démontage
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClose() {
  clearSearch()
  closeSearch()
}
</script>

<style scoped>
.search-button {
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: var(--radius-03);
  box-shadow: inset 0 0 0 1px var(--color-border-strong);
  background-color: transparent;
  transition:
    width var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast);
  width: 38px;
  height: 38px;
}

.search-button:hover {
  box-shadow: inset 0 0 0 1.5px var(--color-brand);
}

.search-button--open {
  width: 200px;
  background-color: var(--color-background);
}

.search-button--open:focus-within {
  box-shadow: inset 0 0 0 1.5px var(--color-brand);
}

.search-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  color: var(--color-brand);
  cursor: pointer;
  flex-shrink: 0;
}

.search-field {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: var(--space-02) var(--space-03);
  border: none;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-small);
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-50);
}

.search-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  color: var(--color-text-50);
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.search-close:hover {
  color: var(--color-brand);
}

/* Fade transition */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity var(--transition-fast);
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}
</style>
