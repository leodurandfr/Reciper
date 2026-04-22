<template>
  <BaseModal :open="isOpen" :title="$t('settings.title')" @close="$emit('close')">
    <div class="settings-content">
      <!-- Export/Import -->
      <section class="settings-section">
        <h2 class="heading-03">{{ $t('settings.data.title') }}</h2>
        <p class="body-small text-muted">{{ $t('settings.data.description') }}</p>

        <div class="data-stats">
          <span class="stat-number">{{ recipeCount }}</span>
          <span class="stat-label">{{ $t('settings.data.recipesStored') }}</span>
        </div>

        <div class="button-group">
          <BaseButton variant="outline" :disabled="exporting" @click="handleExport">
            {{ exporting ? $t('settings.data.exporting') : $t('settings.data.export') }}
          </BaseButton>

          <BaseButton variant="outline" @click="triggerImport">
            {{ $t('settings.data.import') }}
          </BaseButton>
          <input
            ref="importInput"
            type="file"
            accept=".json"
            @change="handleImportFile"
            style="display: none;"
          >
        </div>

        <div v-if="importPreview" class="import-preview">
          <h4>{{ $t('settings.data.importPreviewTitle') }}</h4>
          <p>{{ $t('settings.data.importRecipeCount', { count: importPreview.recipeCount }) }}</p>
          <p class="text-muted">{{ $t('settings.data.importVersion', { version: importPreview.version }) }}</p>

          <div class="import-options">
            <label>
              <input type="checkbox" v-model="importOverwrite">
              {{ $t('settings.data.importOverwrite') }}
            </label>
          </div>

          <div class="button-group">
            <BaseButton variant="fill" :disabled="importing" @click="confirmImport">
              {{ importing ? $t('settings.data.importing') : $t('settings.data.importConfirm') }}
            </BaseButton>
            <BaseButton variant="outline" @click="cancelImport">{{ $t('settings.data.cancel') }}</BaseButton>
          </div>
        </div>

        <div v-if="importResult" :class="['status-message', importResult.type]">
          {{ importResult.message }}
        </div>

        <div class="delete-all-zone">
          <template v-if="!confirmingDeleteAll">
            <BaseButton variant="outline" class="delete-all-btn" :disabled="recipeCount === 0" @click="confirmingDeleteAll = true">
              {{ $t('settings.data.deleteAll') }}
            </BaseButton>
          </template>
          <template v-else>
            <p class="delete-all-warning body-small">{{ $t('settings.data.deleteAllDescription') }}</p>
            <div class="button-group">
              <BaseButton variant="fill" class="delete-all-btn" :disabled="deletingAll" @click="handleDeleteAll">
                {{ deletingAll ? $t('settings.data.deleting') : $t('settings.data.deleteAllConfirm') }}
              </BaseButton>
              <BaseButton variant="outline" @click="confirmingDeleteAll = false">
                {{ $t('settings.data.deleteAllCancel') }}
              </BaseButton>
            </div>
          </template>
        </div>
      </section>

      <!-- Thème -->
      <section class="settings-section">
        <h2 class="heading-03">{{ $t('settings.appearance.title') }}</h2>

        <div class="theme-options">
          <label v-for="option in themeOptions" :key="option.value" class="theme-option">
            <input
              type="radio"
              :value="option.value"
              v-model="theme"
              @change="changeTheme"
            >
            <span>{{ option.label }}</span>
          </label>
        </div>
      </section>

      <!-- Langue -->
      <section class="settings-section">
        <h2 class="heading-03">{{ $t('settings.language.title') }}</h2>

        <div class="theme-options">
          <label v-for="option in languageOptions" :key="option.value" class="theme-option">
            <input
              type="radio"
              :value="option.value"
              v-model="language"
              @change="changeLanguage"
            >
            <span>{{ option.label }}</span>
          </label>
        </div>
      </section>

      <!-- À propos -->
      <section class="settings-section">
        <h2 class="heading-03">{{ $t('settings.about.title') }}</h2>
        <p class="body-small text-muted">
          <span class="version-tap" @click="onVersionTap">{{ $t('settings.about.version') }}</span><br>
          {{ $t('settings.about.description') }}
        </p>
        <div class="about-links">
          <BaseButton tag="a" href="https://github.com/leodurandfr/Reciper" variant="outline">
            GitHub
          </BaseButton>
          <BaseButton tag="a" href="https://www.leodurand.com" variant="outline">
            leodurand.com
          </BaseButton>
        </div>
      </section>

      <!-- Dev: Backend URL (hidden by default, tap version 5x to reveal) -->
      <section v-if="showDevSettings" class="settings-section">
        <h2 class="heading-03">{{ $t('settings.server.title') }}</h2>
        <p class="body-small text-muted">{{ $t('settings.server.description') }}</p>

        <div class="dev-url-group">
          <input
            v-model="backendUrl"
            type="url"
            :placeholder="defaultUrl"
            class="dev-url-input"
          >
          <BaseButton variant="fill" :disabled="saving" @click="saveBackendUrl">
            {{ saving ? $t('settings.server.saving') : $t('settings.server.save') }}
          </BaseButton>
        </div>

        <div v-if="backendStatus" :class="['status-message', backendStatus.type]">
          {{ backendStatus.message }}
        </div>
      </section>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import { getSettings, saveSettings, applyTheme, BACKEND_URL } from '../stores/settings.js'
import { detectBrowserLocale } from '../i18n/detect.js'
import { getRecipeCount, clearAllRecipes } from '../services/db.js'
import { downloadRecipesExport, previewImportFile, importRecipesFromFile } from '../services/exportImport.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const { t, locale } = useI18n()

const recipeCount = ref(0)
const exporting = ref(false)
const importing = ref(false)
const importPreview = ref(null)
const importInput = ref(null)
const importFile = ref(null)
const importOverwrite = ref(false)
const importResult = ref(null)
const confirmingDeleteAll = ref(false)
const deletingAll = ref(false)

const theme = ref('system')

// Hidden dev settings (tap version 5x to reveal)
const devTapCount = ref(0)
const showDevSettings = ref(false)
const backendUrl = ref('')
const saving = ref(false)
const backendStatus = ref(null)
const defaultUrl = BACKEND_URL

const themeOptions = computed(() => [
  { value: 'light', label: t('settings.appearance.light') },
  { value: 'dark', label: t('settings.appearance.dark') },
  { value: 'system', label: t('settings.appearance.system') },
])

const language = ref(null)
const languageOptions = [
  { value: null, label: 'Auto' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
]

// Load data each time the modal opens
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      const settings = await getSettings()
      theme.value = settings.theme
      language.value = settings.language ?? null
      recipeCount.value = await getRecipeCount()

      backendUrl.value = settings.backendUrl || ''

      // Reset transient states
      devTapCount.value = 0
      showDevSettings.value = false
      backendStatus.value = null
      importPreview.value = null
      importFile.value = null
      importResult.value = null
      confirmingDeleteAll.value = false
      deletingAll.value = false
    }
  },
  { immediate: true }
)

async function handleExport() {
  exporting.value = true
  try {
    const result = await downloadRecipesExport()
    if (result.success) {
      importResult.value = {
        type: 'success',
        message: t('settings.data.exportSuccess', { count: result.count })
      }
    }
  } catch (error) {
    importResult.value = {
      type: 'error',
      message: t('settings.data.exportError', { message: error.message })
    }
  } finally {
    exporting.value = false
  }
}

async function handleImportFile(event) {
  const file = event.target.files[0]
  if (!file) return

  importFile.value = file
  importResult.value = null

  try {
    const preview = await previewImportFile(file)
    if (preview.valid) {
      importPreview.value = preview
    } else {
      importResult.value = {
        type: 'error',
        message: t('settings.data.invalidFile', { error: preview.error })
      }
    }
  } catch (error) {
    importResult.value = {
      type: 'error',
      message: t('settings.data.fileError')
    }
  }

  // Reset input
  event.target.value = ''
}

async function confirmImport() {
  if (!importFile.value) return

  importing.value = true
  try {
    const result = await importRecipesFromFile(importFile.value, {
      overwrite: importOverwrite.value
    })

    importResult.value = {
      type: result.errors.length > 0 ? 'error' : 'success',
      message: t('settings.data.importSuccess', { imported: result.imported, skipped: result.skipped })
    }

    recipeCount.value = await getRecipeCount()
    importPreview.value = null
    importFile.value = null
  } catch (error) {
    importResult.value = {
      type: 'error',
      message: t('settings.data.importError', { message: error.message })
    }
  } finally {
    importing.value = false
  }
}

function triggerImport() {
  importInput.value?.click()
}

function cancelImport() {
  importPreview.value = null
  importFile.value = null
}

async function handleDeleteAll() {
  deletingAll.value = true
  try {
    await clearAllRecipes()
    recipeCount.value = 0
    confirmingDeleteAll.value = false
    importResult.value = {
      type: 'success',
      message: t('settings.data.deleteAllSuccess')
    }
  } catch (error) {
    importResult.value = {
      type: 'error',
      message: t('settings.data.deleteAllError', { message: error.message })
    }
  } finally {
    deletingAll.value = false
  }
}

async function changeTheme() {
  await saveSettings({ theme: theme.value })
  applyTheme(theme.value)
}

async function changeLanguage() {
  locale.value = language.value ?? detectBrowserLocale()
  await saveSettings({ language: language.value })
}

function onVersionTap() {
  devTapCount.value++
  if (devTapCount.value >= 5) {
    showDevSettings.value = true
  }
}

async function saveBackendUrl() {
  saving.value = true
  try {
    const url = backendUrl.value.trim() || undefined
    await saveSettings({ backendUrl: url })
    backendStatus.value = {
      type: 'success',
      message: url ? t('settings.server.saved') : t('settings.server.reset')
    }
  } catch {
    backendStatus.value = {
      type: 'error',
      message: t('settings.server.saveError')
    }
  } finally {
    saving.value = false
  }
}

</script>

<style scoped>
.settings-section {
  background: var(--color-background-neutral);
  border-radius: var(--radius-02);
  padding: var(--space-05);
  margin-bottom: var(--space-05);
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h2 {
  margin-bottom: var(--space-02);
}

.settings-section p {
  margin-bottom: var(--space-04);
}

.text-muted {
  color: var(--color-text);
}

.status-message {
  padding: var(--space-03);
  border-radius: var(--radius-01);
  margin-bottom: var(--space-04);
  font-size: var(--font-size-body-small);
}

.status-message.success {
  background-color: var(--color-background);
  color: var(--color-brand);
}

.status-message.error {
  background-color: var(--color-background);
  color: var(--color-brand);
}

.data-stats {
  display: flex;
  align-items: baseline;
  gap: var(--space-02);
  margin-bottom: var(--space-04);
}

.stat-number {
  font-size: var(--font-size-heading-02);
  font-weight: 700;
  color: var(--color-brand);
}

.stat-label {
  color: var(--color-text);
}

.button-group {
  display: flex;
  gap: var(--space-03);
  flex-wrap: wrap;
}

.import-preview {
  background: var(--color-background);
  border: 1px solid var(--color-text);
  border-radius: var(--radius-01);
  padding: var(--space-04);
  margin-top: var(--space-04);
}

.import-preview h4 {
  margin-bottom: var(--space-02);
}

.import-options {
  margin: var(--space-04) 0;
}

.import-options label {
  display: flex;
  align-items: center;
  gap: var(--space-02);
  cursor: pointer;
}

.delete-all-zone {
  margin-top: var(--space-05);
  padding-top: var(--space-05);
  border-top: 1px solid var(--color-border-strong);
}

.delete-all-warning {
  color: var(--color-brand);
  margin-bottom: var(--space-03);
}

.delete-all-btn {
  color: #c53030;
  border-color: #c53030;
}

.delete-all-btn:hover:not(.base-btn--disabled) {
  box-shadow: inset 0 0 0 1.5px #c53030;
}

.delete-all-btn.base-btn--fill {
  background-color: #c53030;
  color: white;
  box-shadow: none;
}

.delete-all-btn.base-btn--fill:hover:not(.base-btn--disabled) {
  background-color: #9b2c2c;
  box-shadow: none;
}

.theme-options {
  display: flex;
  gap: var(--space-04);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--space-02);
  cursor: pointer;
}

.about-links {
  display: flex;
  gap: var(--space-03);
}

.version-tap {
  cursor: default;
  user-select: none;
}

.dev-url-group {
  display: flex;
  gap: var(--space-03);
  margin-bottom: var(--space-04);
}

.dev-url-input {
  flex: 1;
}
</style>
