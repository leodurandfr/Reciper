<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay">
        <div class="modal-grid" @click.self="$emit('close')">
          <div class="modal-panel">
            <header class="modal-header">
              <slot name="header">
                <h2 class="heading-03">{{ title }}</h2>
              </slot>
              <button @click="$emit('close')" class="modal-close" aria-label="Fermer">
                &times;
              </button>
            </header>

            <div class="modal-body">
              <slot />
            </div>

            <footer v-if="$slots.footer" class="modal-footer">
              <slot name="footer" />
            </footer>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color--contrast-50);
  z-index: 1000;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.modal-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: var(--grid-gutter);
  padding: var(--space-06) var(--grid-margin);
  align-items: stretch;
}

.modal-panel {
  grid-column: 3 / 11;
  background: var(--color-background);
  border-radius: var(--radius-07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-05);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
  padding: var(--space-02);
  line-height: 1;
  border-radius: var(--radius-01);
  transition: background-color var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--color-border);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-05);
}

.modal-footer {
  padding: var(--space-04) var(--space-05);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* Transition: overlay fade */
.modal-enter-active,
.modal-leave-active {
  transition: background-color 300ms ease-out;
}

.modal-enter-from,
.modal-leave-to {
  background-color: transparent;
}

/* Transition: panel slide + fade */
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.modal-enter-from .modal-panel {
  opacity: 0;
  transform: translateY(16px);
}

.modal-leave-to .modal-panel {
  opacity: 0;
  transform: translateY(-16px);
}

/* Tablet */
@media (max-width: 1024px) {
  .modal-panel {
    grid-column: 2 / 12;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .modal-grid {
    grid-template-columns: 1fr;
    padding: var(--space-04) var(--grid-margin);
    column-gap: 0;
  }

  .modal-panel {
    grid-column: 1 / -1;
    border-radius: var(--radius-04);
  }
}
</style>
