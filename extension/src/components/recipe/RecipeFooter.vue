<template>
  <footer class="recipe-footer">
    <BaseButton tag="a" :href="recipe.url" variant="outline" @click="handleSourceClick">
      {{ $t('recipe.source', { host: recipe.host }) }}
    </BaseButton>

    <div class="actions">
      <BaseButton variant="outline" :disabled="sharing" @click="handleShare">
        {{ shareLabel }}
      </BaseButton>
      <BaseButton variant="outline" @click="$emit('edit')">
        {{ $t('recipe.edit') }}
      </BaseButton>
      <BaseButton variant="outline" :disabled="deleting" @click="confirmDelete">
        {{ deleting ? $t('recipe.deleting') : $t('recipe.delete') }}
      </BaseButton>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteRecipe } from '../../services/db.js'
import { shareRecipe } from '../../services/api.js'
import BaseButton from '../BaseButton.vue'

const { t } = useI18n()

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'deleted'])

const deleting = ref(false)
const sharing = ref(false)
const shareCopied = ref(false)

const shareLabel = computed(() => {
  if (shareCopied.value) return t('recipe.shareCopied')
  if (sharing.value) return t('recipe.sharing')
  return t('recipe.share')
})

async function handleShare() {
  sharing.value = true
  try {
    const { url } = await shareRecipe(props.recipe)
    await navigator.clipboard.writeText(url)
    shareCopied.value = true
    setTimeout(() => { shareCopied.value = false }, 3000)
  } catch (err) {
    console.error('Erreur partage:', err)
    alert(t('recipe.shareError'))
  } finally {
    sharing.value = false
  }
}

async function handleSourceClick(event) {
  event.preventDefault()
  if (chrome?.runtime?.sendMessage) {
    await chrome.runtime.sendMessage({ type: 'BYPASS_URL', url: props.recipe.url })
  }
  window.open(props.recipe.url, '_blank', 'noopener')
}

async function confirmDelete() {
  if (!confirm(t('recipe.deleteConfirm'))) return

  deleting.value = true
  try {
    await deleteRecipe(props.recipe.id)
    emit('deleted')
  } catch (err) {
    console.error('Erreur suppression:', err)
    alert(t('errors.deleteFailed'))
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
