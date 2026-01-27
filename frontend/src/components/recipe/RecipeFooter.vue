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
import { useRouter } from 'vue-router'
import { deleteRecipe, toggleFavorite } from '../../services/api'

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'favorite-toggled'])

const router = useRouter()
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
    alert('Erreur lors de la mise a jour des favoris')
  } finally {
    togglingFavorite.value = false
  }
}

async function confirmDelete() {
  if (!confirm('Voulez-vous vraiment supprimer cette recette ?')) return

  deleting.value = true
  try {
    await deleteRecipe(props.recipe.id)
    router.push('/')
  } catch (err) {
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
  border-top: 1px solid #eee;
  margin-top: var(--space-05);
}

.source-link {
  color: #666;
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
  border: 1px solid #ccc;
  border-radius: var(--radius-01);
  background: white;
  cursor: pointer;
}

.btn-edit:hover,
.btn-favorite:hover {
  background: #f5f5f5;
}

.btn-delete {
  border-color: #dc3545;
  color: #dc3545;
}

.btn-delete:hover:not(:disabled) {
  background: #dc3545;
  color: white;
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
