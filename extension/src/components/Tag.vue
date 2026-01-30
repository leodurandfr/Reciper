<template>
  <div class="tag body-small">
    <span class="tag-label">{{ label }}</span>
    <span class="tag-value">{{ value }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
})
</script>

<style scoped>
.tag {
  display: inline-flex;
  gap: var(--space-01);
}

.tag-label {
  color: var(--color-text);
}

.tag-value {
  color: var(--color-brand);
  font-weight: 500;
}
</style>
