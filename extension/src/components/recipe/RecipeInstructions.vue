<template>
  <section class="recipe-instructions">
    <h2 class="heading-03">Instructions</h2>

    <ol class="instructions-list">
      <li v-for="step in instructions" :key="step.step_number">
        <span class="step-number body-small">Etape {{ step.step_number }}</span>
        <p class="step-text body-medium">{{ step.text }}</p>
      </li>
    </ol>
  </section>
</template>

<script setup>
defineProps({
  instructions: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.recipe-instructions h2 {
  margin: 0 0 var(--space-04) 0;
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instructions-list li {
  padding: var(--space-04) 0;
  border-bottom: 1px solid var(--color-text);
}

.instructions-list li:last-child {
  border-bottom: none;
}

.step-number {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-02);
}

.step-text {
  margin: 0;
}
</style>
