<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal">
      <header class="modal-header">
        <h2 class="heading-03">Modifier la recette</h2>
        <button @click="close" class="btn-close">&times;</button>
      </header>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="title">Titre</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="prep_time">Temps de préparation (min)</label>
            <input
              id="prep_time"
              v-model.number="form.prep_time"
              type="number"
              min="0"
            />
          </div>

          <div class="form-group">
            <label for="cook_time">Temps de cuisson (min)</label>
            <input
              id="cook_time"
              v-model.number="form.cook_time"
              type="number"
              min="0"
            />
          </div>

          <div class="form-group">
            <label for="yields">Portions</label>
            <input
              id="yields"
              v-model="form.yields"
              type="text"
              placeholder="Ex: 6 personnes"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="ingredients">Ingrédients (un par ligne)</label>
          <textarea
            id="ingredients"
            v-model="ingredientsText"
            rows="8"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="instructions">Instructions (une par ligne)</label>
          <textarea
            id="instructions"
            v-model="instructionsText"
            rows="10"
          ></textarea>
        </div>

        <footer class="modal-footer">
          <button type="button" @click="close" class="btn-cancel body-small">
            Annuler
          </button>
          <button type="submit" class="btn-save body-small" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { updateRecipe } from '../../services/db.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  recipe: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'updated'])

const saving = ref(false)

const form = ref({
  title: '',
  description: '',
  prep_time: null,
  cook_time: null,
  yields: '',
})

const ingredientsText = ref('')
const instructionsText = ref('')

// Initialize form when recipe changes or modal opens
watch(
  () => [props.recipe, props.isOpen],
  () => {
    if (props.isOpen && props.recipe) {
      form.value = {
        title: props.recipe.title || '',
        description: props.recipe.description || '',
        prep_time: props.recipe.prep_time,
        cook_time: props.recipe.cook_time,
        yields: props.recipe.yields || '',
      }
      ingredientsText.value = (props.recipe.ingredients || []).join('\n')
      instructionsText.value = (props.recipe.instructions || []).join('\n')
    }
  },
  { immediate: true }
)

function close() {
  emit('close')
}

async function handleSubmit() {
  saving.value = true

  try {
    const ingredients = ingredientsText.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const instructions = instructionsText.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    // Calculer total_time
    const prepTime = form.value.prep_time || 0
    const cookTime = form.value.cook_time || 0
    const totalTime = prepTime + cookTime > 0 ? prepTime + cookTime : null

    const data = {
      title: form.value.title,
      description: form.value.description || null,
      prep_time: form.value.prep_time || null,
      cook_time: form.value.cook_time || null,
      total_time: totalTime,
      yields: form.value.yields || null,
      ingredients,
      instructions,
    }

    const updated = await updateRecipe(props.recipe.id, data)
    emit('updated', updated)
    close()
  } catch (err) {
    console.error('Erreur mise à jour:', err)
    alert('Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-04);
}

.modal {
  background: var(--color-background);
  border-radius: var(--radius-02);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-04) var(--space-05);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-subdued);
}

.modal-body {
  padding: var(--space-05);
}

.form-group {
  margin-bottom: var(--space-04);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-01);
  font-weight: 500;
  color: var(--color-text);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--space-02) var(--space-03);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-01);
  font-family: inherit;
  background: var(--color-background);
  color: var(--color-text);
}

.form-group textarea {
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-04);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-02);
  padding-top: var(--space-04);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-04);
}

.btn-cancel,
.btn-save {
  padding: var(--space-02) var(--space-04);
  border-radius: var(--radius-01);
  cursor: pointer;
}

.btn-cancel {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-save {
  background: var(--color-background-contrast);
  color: var(--color-text-contrast);
  border: none;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
