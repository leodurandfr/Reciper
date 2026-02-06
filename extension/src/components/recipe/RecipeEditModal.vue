<template>
  <BaseModal :open="isOpen" :title="$t('editModal.title')" @close="close">
    <form @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-group">
        <label for="title">{{ $t('editModal.titleLabel') }}</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="prep_time">{{ $t('editModal.prepTime') }}</label>
          <input
            id="prep_time"
            v-model.number="form.prep_time"
            type="number"
            min="0"
          />
        </div>

        <div class="form-group">
          <label for="cook_time">{{ $t('editModal.cookTime') }}</label>
          <input
            id="cook_time"
            v-model.number="form.cook_time"
            type="number"
            min="0"
          />
        </div>

        <div class="form-group">
          <label for="yields">{{ $t('editModal.yields') }}</label>
          <input
            id="yields"
            v-model="form.yields"
            type="text"
            :placeholder="$t('editModal.yieldsPlaceholder')"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="ingredients">{{ $t('editModal.ingredientsLabel') }}</label>
        <textarea
          id="ingredients"
          v-model="ingredientsText"
          rows="8"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="instructions">{{ $t('editModal.instructionsLabel') }}</label>
        <textarea
          id="instructions"
          v-model="instructionsText"
          rows="10"
        ></textarea>
      </div>

      <div class="form-actions">
        <BaseButton variant="outline" type="button" @click="close">
          {{ $t('editModal.cancel') }}
        </BaseButton>
        <BaseButton variant="fill" type="submit" :disabled="saving">
          {{ saving ? $t('editModal.saving') : $t('editModal.save') }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateRecipe } from '../../services/db.js'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'

const { t } = useI18n()

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
    alert(t('editModal.updateError'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
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
  border: 1px solid var(--color-text);
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-02);
  padding-top: var(--space-04);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-04);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
