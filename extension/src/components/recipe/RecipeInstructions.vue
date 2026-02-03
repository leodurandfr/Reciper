<template>
  <section class="recipe-instructions">
    <h2 class="heading-03">Instructions</h2>

    <ol class="instructions-list">
      <li v-for="step in instructions" :key="step.step_number">
        <span class="step-number body-medium">Etape {{ step.step_number }}</span>
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
  margin: 0 0 var(--space-05) 0;
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instructions-list li {
  padding: var(--space-05) 0;
  border-bottom: 2px solid var(--color-border);
}

.instructions-list li:first-child {
  border-top: 2px solid var(--color-border);
}

.instructions-list li:last-child {
  border-bottom: none;
}

.step-number {
  display: block;
  color: var(--color-text-50);
  margin-bottom: var(--space-03);
}

.step-text {
  margin: 0;
}
</style>
