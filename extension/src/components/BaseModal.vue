<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay">
        <div class="modal-grid" @mousedown.self="downOnBackdrop = true" @click.self="handleBackdropClick">
          <div
            ref="panel"
            class="modal-panel"
            :class="`modal-panel--${size}`"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="$slots.header ? undefined : titleId"
            :aria-label="$slots.header ? title || undefined : undefined"
            tabindex="-1"
            @mousedown="downOnBackdrop = false"
          >
            <header class="modal-header">
              <slot name="header">
                <h2 :id="titleId" class="heading-03">{{ title }}</h2>
              </slot>
              <button @click="$emit('close')" class="modal-close" :aria-label="$t('modal.close')">
                <Icon name="close" size="md" />
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

<script>
// Compteur partagé entre les instances, pour des id de titre uniques
let modalCount = 0
</script>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  // 'small': narrower panel that hugs its content height
  size: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'small'].includes(v),
  },
})

const emit = defineEmits(['close'])

const titleId = `modal-title-${++modalCount}`
const panel = ref(null)

// Ne fermer au clic sur le fond que si le clic a aussi commencé sur le fond :
// une sélection de texte commencée dans le panneau et relâchée dehors ne ferme pas la modale
const downOnBackdrop = ref(false)

function handleBackdropClick() {
  if (downOnBackdrop.value) emit('close')
  downOnBackdrop.value = false
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'Tab' && panel.value) {
    // Garder le focus dans le panneau
    const focusables = [...panel.value.querySelectorAll(FOCUSABLE)]
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && (document.activeElement === first || !panel.value.contains(document.activeElement))) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (document.activeElement === last || !panel.value.contains(document.activeElement))) {
      e.preventDefault()
      first.focus()
    }
  }
}

// Élément qui avait le focus avant l'ouverture, pour le lui rendre à la fermeture
let previousFocus = null

watch(
  () => props.open,
  async (isOpen, wasOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
      previousFocus = document.activeElement
      await nextTick()
      panel.value?.focus()
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
      if (wasOpen) restoreFocus()
    }
  },
  { immediate: true }
)

function restoreFocus() {
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus()
  }
  previousFocus = null
}

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
  if (props.open) restoreFocus()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
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

.modal-panel--small {
  grid-column: 4 / 10;
  align-self: center;
  max-height: 100%;
}

.modal-panel:focus {
  outline: none;
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
  cursor: pointer;
  color: var(--color-text);
  padding: var(--space-02);
  line-height: 0;
  border-radius: var(--radius-01);
  transition: background-color var(--transition-fast);
}

.modal-close:hover {
  background-color: var(--color-border);
}

.modal-body {
  flex: 1;
  min-height: 0;
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

  .modal-panel--small {
    grid-column: 3 / 11;
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
