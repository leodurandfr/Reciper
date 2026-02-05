<template>
  <header class="app-header">
    <div class="header-left" :class="{ 'header-slots-hidden': largeTitle }">
      <Transition name="header-fade">
        <BaseButton
          v-if="leftButton"
          variant="outline"
          :icon-left="leftButton.iconLeft"
          @click="leftButton.handler"
        >
          {{ leftButton.label }}
        </BaseButton>
      </Transition>
    </div>
    <router-link to="/favorites" class="logo" :class="{ 'logo--large': largeTitle }">Reciper</router-link>
    <div class="header-right" :class="{ 'header-slots-hidden': largeTitle }">
      <Transition name="header-fade">
        <BaseButton
          v-if="rightButton"
          variant="outline"
          :disabled="rightButton.disabled"
          @click="rightButton.handler"
        >
          {{ rightButton.label }}
        </BaseButton>
      </Transition>
    </div>
  </header>
</template>

<script setup>
import BaseButton from './BaseButton.vue'
import { useHeaderButtons } from '../composables/useHeaderButtons.js'

defineProps({
  largeTitle: {
    type: Boolean,
    default: false,
  },
})

const { leftButton, rightButton } = useHeaderButtons()
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
  flex: 1;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.header-slots-hidden {
  pointer-events: none;
}

.header-left {
  display: flex;
  justify-content: flex-start;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.header-fade-enter-active,
.header-fade-leave-active {
  transition: opacity var(--transition-fast);
}

.header-fade-enter-from,
.header-fade-leave-to {
  opacity: 0;
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

@media (max-width: 1280px) {
  .app-header {
    grid-column: 1 / 13;
  }

  .logo--large {
    font-size: 48px;
  }
}

@media (max-width: 800px) {
  .app-header {
    grid-column: 1 / -1;
  }

  .logo--large {
    font-size: 32px;
  }
}
</style>
