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
        <div v-if="!currentImage" class="spinner"></div>
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

// Auto-discover all ingredient images at build time
const ingredientModules = import.meta.glob(
  '@/assets/ingredients/**/*.{png,jpg,svg,webp}',
  { eager: true, import: 'default' }
)
const allImages = Object.values(ingredientModules)

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

  // Demo mode: skip scraping, let the loader cycle indefinitely
  if (route.query.demo === 'true') return

  const url = route.query.url

  if (!url) {
    error.value = t('loading.missingUrl')
    return
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'SCRAPE_AND_SAVE',
      url: url
    })

    if (response.success) {
      router.replace(`/recipe/${response.recipeId}`)
    } else {
      throw new Error(response.error || t('loading.scrapingError'))
    }
  } catch (err) {
    error.value = err.message || t('errors.unknown')
  }
})

onUnmounted(() => {
  if (cycleInterval) {
    clearInterval(cycleInterval)
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

/* Fallback spinner */
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
