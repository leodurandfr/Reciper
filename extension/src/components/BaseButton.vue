<template>
  <component
    :is="tag"
    :class="[
      'base-btn',
      `base-btn--${variant}`,
      {
        'base-btn--disabled': disabled,
        'base-btn--has-icon-left': iconLeft,
      }
    ]"
    :href="tag === 'a' ? href : undefined"
    :to="tag === 'router-link' ? to : undefined"
    :target="tag === 'a' ? '_blank' : undefined"
    :rel="tag === 'a' ? 'noopener' : undefined"
    :disabled="tag === 'button' ? disabled || undefined : undefined"
    v-bind="$attrs"
  >
<Icon v-if="iconLeft === 'chevron-left'" name="chevron-left" size="sm" />
    <slot />
  </component>
</template>

<script setup>
import Icon from './Icon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'outline',
    validator: (v) => ['fill', 'outline'].includes(v),
  },
  tag: {
    type: String,
    default: 'button',
    validator: (v) => ['button', 'a', 'router-link'].includes(v),
  },
  href: {
    type: String,
    default: null,
  },
  to: {
    type: [String, Object],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  iconLeft: {
    type: String,
    default: null,
  },
})

</script>

<style>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-02);
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);
  font-family: var(--font-family-body);
  letter-spacing: var(--letter-spacing-body);
  line-height: var(--line-height-body);
  border: none;
  background: none;
  border-radius: var(--radius-03);
  font-size: var(--font-size-body-small);
  padding: var(--space-02) var(--space-04);
}

/* --- Variant: fill --- */
.base-btn--fill {
  background-color: var(--color-brand);
  color: var(--color-text-contrast);
}

.base-btn--fill:hover:not(.base-btn--disabled) {
  background-color: var(--color-brand-hover);
}

/* --- Variant: outline --- */
.base-btn--outline {
  background-color: transparent;
  color: var(--color-brand);
  box-shadow: inset 0 0 0 1px var(--color-border-strong);
}

.base-btn--outline:hover:not(.base-btn--disabled) {
  box-shadow: inset 0 0 0 1.5px var(--color-brand);
}

/* --- Icon left padding --- */
.base-btn--has-icon-left {
  padding: var(--space-02) var(--space-04) var(--space-02) var(--space-03);
}

/* --- Disabled state --- */
.base-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
