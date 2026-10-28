<template>
  <div class="loading-view">
    <div v-if="!error" class="loader">
      <div class="ingredient-cycle">
        <Transition name="ingredient" mode="out-in">
          <img
            v-if="currentImage"
            :key="currentImage"
            :src="currentImage"
            class="ingredient-img"
            alt=""
          />
        </Transition>
      </div>
    </div>

    <div v-else class="error-content">
      <div class="error-icon">✗</div>
      <h2 class="heading-03">{{ $t('loading.errorOccurred') }}</h2>
      <p class="error-message">{{ error }}</p>
      <BaseButton variant="fill" icon-left="chevron-left" @click="goBack">
        {{ $t('loading.backToSite') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import { ingredientImages } from '@/assets/ingredientImages'

const allImages = Object.values(ingredientImages)

// Fisher-Yates shuffle
function shuffle(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const error = ref('')
const currentImage = ref(allImages.length > 0 ? allImages[0] : null)
let cycleInterval = null
let imageIndex = 0
let shuffledImages = shuffle(allImages)
// Passe à false au démontage : la réponse du scraping est alors ignorée
let active = true

function stopCycle() {
  if (cycleInterval) {
    clearInterval(cycleInterval)
    cycleInterval = null
  }
}

function startCycle() {
  if (shuffledImages.length === 0) return

  imageIndex = 0
  currentImage.value = shuffledImages[0]

  cycleInterval = setInterval(() => {
    imageIndex = (imageIndex + 1) % shuffledImages.length
    // Re-shuffle when we've gone through all images
    if (imageIndex === 0) {
      shuffledImages = shuffle(allImages)
    }
    currentImage.value = shuffledImages[imageIndex]
  }, 250)
}

onMounted(async () => {
  startCycle()

  const url = route.query.url

  if (!url) {
    stopCycle()
    error.value = t('loading.missingUrl')
    return
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'SCRAPE_AND_SAVE',
      url: url
    })

    // L'utilisateur a quitté la page pendant le scraping : ne pas le ramener de force
    if (!active) return

    if (response?.success) {
      const referrerUrl = route.query.referrerUrl
      const target = referrerUrl
        ? `/recipe/${response.recipeId}?referrerUrl=${encodeURIComponent(referrerUrl)}`
        : `/recipe/${response.recipeId}`
      router.replace(target)
    } else {
      throw new Error(response?.error || t('loading.scrapingError'))
    }
  } catch (err) {
    if (!active) return
    stopCycle()
    error.value = err.message || t('errors.unknown')
  }
})

onUnmounted(() => {
  active = false
  stopCycle()
})

async function goBack() {
  const returnUrl = route.query.returnUrl
  if (returnUrl) {
    // Otherwise the service worker intercepts the navigation again and sends the tab back here
    if (chrome?.runtime?.sendMessage) {
      await chrome.runtime.sendMessage({ type: 'BYPASS_URL', url: returnUrl }).catch(() => {})
    }
    window.location.href = returnUrl
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.loading-view {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ingredient-cycle {
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ingredient-img {
  width: 96px;
  height: 96px;
  object-fit: contain;
}

/* Crossfade transition */
.ingredient-enter-active,
.ingredient-leave-active {
  transition: opacity 80ms ease;
}

.ingredient-enter-from,
.ingredient-leave-to {
  opacity: 0;
}

/* Error state */
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-03);
  max-width: 400px;
  text-align: center;
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
