<template>
  <footer class="recipe-footer">
    <BaseButton tag="a" :href="recipe.url" variant="outline">
      Source: {{ recipe.host }}
    </BaseButton>

    <div class="actions">
      <BaseButton variant="outline" @click="$emit('edit')">
        Modifier
      </BaseButton>
      <BaseButton variant="outline" :disabled="deleting" @click="confirmDelete">
        {{ deleting ? 'Suppression...' : 'Supprimer' }}
      </BaseButton>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { deleteRecipe } from '../../services/db.js'
import BaseButton from '../BaseButton.vue'

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'deleted'])

const deleting = ref(false)

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
  border-top: 2px solid var(--color-border);
}

.actions {
  display: flex;
  gap: var(--space-02);
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
