<template>
  <section class="recipe-ingredients">
    <div class="section-header">
      <h2 class="heading-03">Ingredients</h2>
      <select v-model="portions" class="portion-select body-small">
        <option v-for="n in portionOptions" :key="n" :value="n">
          {{ n }}
        </option>
      </select>
    </div>

    <ul class="ingredients-list">
      <li v-for="(ingredient, index) in scaledIngredients" :key="index">
        <div class="ingredient-image"></div>
        <div class="ingredient-content">
          <span class="ingredient-text">{{ ingredient }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  ingredients: {
    type: Array,
    required: true,
  },
  scaledIngredients: {
    type: Array,
    required: true,
  },
  currentPortions: {
    type: Number,
    required: true,
  },
  portionOptions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:current-portions'])

const portions = computed({
  get: () => props.currentPortions,
  set: (val) => emit('update:current-portions', val),
})
</script>

<style scoped>
.recipe-ingredients {
  margin-bottom: var(--space-05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-04);
}

.section-header h2 {
  margin: 0;
}

.portion-select {
  padding: var(--space-02) var(--space-03);
  border: 1px solid #ccc;
  border-radius: var(--radius-01);
}

.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredients-list li {
  display: flex;
  align-items: center;
  gap: var(--space-03);
  padding: var(--space-03) 0;
  border-bottom: 1px solid #eee;
}

.ingredients-list li:last-child {
  border-bottom: none;
}

.ingredient-image {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: var(--radius-01);
  flex-shrink: 0;
}

.ingredient-content {
  display: flex;
  gap: var(--space-02);
  flex-wrap: wrap;
}

.ingredient-text {
  color: #333;
}
</style>
