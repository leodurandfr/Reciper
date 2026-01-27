<template>
  <footer class="recipe-footer col-full">
    <a :href="recipe.url" target="_blank" rel="noopener" class="source-link body-small">
      Source: {{ recipe.host }}
    </a>

    <div class="actions">
      <button @click="$emit('edit')" class="btn-edit body-small">
        Modifier
      </button>
      <button @click="handleToggleFavorite" class="btn-favorite body-small" :disabled="togglingFavorite">
        {{ togglingFavorite ? '...' : (isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris') }}
      </button>
      <button @click="confirmDelete" class="btn-delete body-small" :disabled="deleting">
        {{ deleting ? 'Suppression...' : 'Supprimer' }}
      </button>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { deleteRecipe, toggleFavorite } from '../../services/db.js'

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'favorite-toggled', 'deleted'])

const deleting = ref(false)
const togglingFavorite = ref(false)
const localIsFavorite = ref(null)

const isFavorite = computed(() => {
  return localIsFavorite.value !== null ? localIsFavorite.value : props.recipe.is_favorite
})

async function handleToggleFavorite() {
  togglingFavorite.value = true
  try {
    const updated = await toggleFavorite(props.recipe.id)
    localIsFavorite.value = updated.is_favorite
    emit('favorite-toggled', updated.is_favorite)
  } catch (err) {
    console.error('Erreur toggle favori:', err)
    alert('Erreur lors de la mise à jour des favoris')
  } finally {
    togglingFavorite.value = false
  }
}

async function confirmDelete() {
  if (!confirm('Voulez-vous vraiment supprimer cette recette ?')) return

  deleting.value = true
  try {
    await deleteRecipe(props.recipe.id)
    emit('deleted')
  } catch (err) {
    console.error('Erreur suppression:', err)
    alert('Erreur lors de la suppression')
    deleting.value = false
  }
}
</script>

<style scoped>
.recipe-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-05);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-05);
}

.source-link {
  color: var(--color-text-subdued);
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

.actions {
  display: flex;
  gap: var(--space-02);
}

.btn-edit,
.btn-favorite,
.btn-delete {
  padding: var(--space-02) var(--space-04);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-01);
  background: var(--color-background);
  cursor: pointer;
  color: var(--color-text);
}

.btn-edit:hover,
.btn-favorite:hover {
  background: var(--color-background-neutral);
}

.btn-delete {
  border-color: var(--color-error);
  color: var(--color-error);
}

.btn-delete:hover:not(:disabled) {
  background: var(--color-error);
  color: var(--color-text-contrast);
}

.btn-edit:disabled,
.btn-favorite:disabled,
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .recipe-footer {
    flex-direction: column;
    gap: var(--space-04);
    align-items: flex-start;
  }

  .actions {
    flex-wrap: wrap;
  }
}
</style>
