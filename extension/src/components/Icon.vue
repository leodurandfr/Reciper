<template>
  <span
    class="icon"
    :class="`icon--${size}`"
    v-html="iconSvg"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from 'vue'

import chevronLeft from '@/assets/icons/chevron-left.svg?raw'
import close from '@/assets/icons/close.svg?raw'
import arrowsVertical from '@/assets/icons/arrows-vertical.svg?raw'
import cutlery from '@/assets/icons/cutlery.svg?raw'
import magnifyingGlass from '@/assets/icons/magnifying-glass.svg?raw'

const icons = {
  'chevron-left': chevronLeft,
  'close': close,
  'arrows-vertical': arrowsVertical,
  'cutlery': cutlery,
  'magnifying-glass': magnifyingGlass,
}

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (val) => ['chevron-left', 'close', 'arrows-vertical', 'cutlery', 'magnifying-glass'].includes(val),
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg'].includes(val),
  },
})

const iconSvg = computed(() => icons[props.name] || '')
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
}

.icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.icon--sm {
  width: 16px;
  height: 16px;
}

.icon--md {
  width: 20px;
  height: 20px;
}

.icon--lg {
  width: 24px;
  height: 24px;
}
</style>
