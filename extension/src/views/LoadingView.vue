<template>
  <div class="loading-view">
    <div class="loading-container">
      <div class="loading-header">
        <span class="loading-icon">🍳</span>
        <h1 class="heading-02">Reciper</h1>
      </div>

      <div v-if="!error" class="loading-content">
        <div class="spinner"></div>
        <p class="loading-status">{{ status }}</p>
      </div>

      <div v-else class="error-content">
        <div class="error-icon">✗</div>
        <h2 class="heading-03">Une erreur s'est produite</h2>
        <p class="error-message">{{ error }}</p>
        <BaseButton variant="fill" icon-left="chevron-left" @click="goBack">
          Retour au site
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const status = ref('Connexion au serveur...')
const error = ref('')

onMounted(async () => {
  const url = route.query.url

  if (!url) {
    error.value = 'URL manquante'
    return
  }

  try {
    status.value = 'Récupération de la recette...'

    const response = await chrome.runtime.sendMessage({
      type: 'SCRAPE_AND_SAVE',
      url: url
    })

    if (response.success) {
      router.replace(`/recipe/${response.recipeId}`)
    } else {
      throw new Error(response.error || 'Erreur lors du scraping')
    }
  } catch (err) {
    error.value = err.message || 'Erreur inconnue'
  }
})

function goBack() {
  const returnUrl = route.query.returnUrl
  if (returnUrl) {
    window.location.href = returnUrl
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.loading-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: var(--space-04);
}

.loading-container {
  text-align: center;
  max-width: 400px;
}

.loading-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-03);
  margin-bottom: var(--space-06);
}

.loading-icon {
  font-size: 2rem;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-04);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-text);
  border-top-color: var(--color-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-status {
  color: var(--color-text);
  font-size: var(--font-size-body);
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-03);
}

.error-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-background);
  color: var(--color-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.error-message {
  color: var(--color-brand);
  background-color: var(--color-background);
  padding: var(--space-03) var(--space-04);
  border-radius: var(--radius-01);
  margin-bottom: var(--space-03);
}

</style>
