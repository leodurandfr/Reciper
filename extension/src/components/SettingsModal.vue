<template>
  <BaseModal :open="isOpen" :title="$t('settings.title')" size="small" @close="$emit('close')">
    <div class="settings-content">
      <!-- Préférences -->
      <section class="settings-section">
        <h3 class="section-label body-small">{{ $t('settings.preferences.title') }}</h3>
        <div class="settings-card">
          <div class="settings-row">
            <label for="settings-theme" class="row-title">{{ $t('settings.appearance.title') }}</label>
            <div class="select">
              <select id="settings-theme" v-model="theme" @change="changeTheme">
                <option v-for="option in themeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <Icon name="arrows-vertical" size="sm" class="select-icon" />
            </div>
          </div>

          <div class="settings-row">
            <label for="settings-language" class="row-title">{{ $t('settings.language.title') }}</label>
            <div class="select">
              <select id="settings-language" v-model="language" @change="changeLanguage">
                <option v-for="option in languageOptions" :key="option.label" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <Icon name="arrows-vertical" size="sm" class="select-icon" />
            </div>
          </div>
        </div>
      </section>

      <!-- Récupération des recettes -->
      <section class="settings-section">
        <h3 class="section-label body-small">{{ $t('settings.scraping.title') }}</h3>
        <div class="settings-card">
          <label class="settings-row settings-row--clickable">
            <span class="row-text">
              <span class="row-title">{{ $t('settings.scraping.anySite') }}</span>
              <span class="row-description body-small">{{ $t('settings.scraping.anySiteDescription') }}</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              class="switch"
              v-model="scrapeAnySite"
              @change="changeScrapeAnySite"
            >
          </label>
        </div>
      </section>

      <!-- Export/Import -->
      <section class="settings-section">
        <h3 class="section-label body-small">{{ $t('settings.data.title') }}</h3>
        <div class="settings-card">
          <div class="settings-row settings-row--wrap">
            <span class="row-text">
              <span class="data-stats">
                <span class="stat-number">{{ recipeCount }}</span>
                <span class="row-title">{{ $t('settings.data.recipesStored') }}</span>
              </span>
              <span class="row-description body-small">{{ $t('settings.data.description') }}</span>
            </span>
            <div class="button-group">
              <BaseButton variant="outline" :disabled="exporting || recipeCount === 0" @click="handleExport">
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
                hidden
              >
            </div>
          </div>

          <div v-if="importPreview" class="settings-row settings-row--stacked">
            <div class="import-preview">
              <span class="import-preview-header">
                <span class="row-title">{{ $t('settings.data.importPreviewTitle') }}</span>
                <span class="row-description body-small">{{ $t('settings.data.importVersion', { version: importPreview.version }) }}</span>
              </span>
              <p class="import-count heading-03">
                {{ $t('settings.data.importRecipeCount', { count: importPreview.recipeCount }) }}
              </p>

              <label class="import-option body-small">
                <span>{{ $t('settings.data.importOverwrite') }}</span>
                <input type="checkbox" role="switch" class="switch" v-model="importOverwrite">
              </label>

              <div class="button-group button-group--end">
                <BaseButton variant="outline" @click="cancelImport">{{ $t('settings.data.cancel') }}</BaseButton>
                <BaseButton variant="fill" :disabled="importing" @click="confirmImport">
                  {{ importing ? $t('settings.data.importing') : $t('settings.data.importConfirm') }}
                </BaseButton>
              </div>
            </div>
          </div>

          <div v-if="importResult" class="settings-row settings-row--stacked">
            <p :class="['status-message', 'body-small', `status-message--${importResult.type}`]" role="status">
              {{ importResult.message }}
            </p>
          </div>

          <div class="settings-row settings-row--wrap">
            <span
              class="row-description body-small"
              :class="{ 'row-description--danger': confirmingDeleteAll }"
            >
              {{ $t('settings.data.deleteAllDescription') }}
            </span>
            <div v-if="!confirmingDeleteAll" class="button-group">
              <BaseButton variant="outline" class="danger-btn" :disabled="recipeCount === 0" @click="confirmingDeleteAll = true">
                {{ $t('settings.data.deleteAll') }}
              </BaseButton>
            </div>
            <div v-else class="button-group">
              <BaseButton variant="outline" @click="confirmingDeleteAll = false">
                {{ $t('settings.data.deleteAllCancel') }}
              </BaseButton>
              <BaseButton variant="fill" class="danger-btn" :disabled="deletingAll" @click="handleDeleteAll">
                {{ deletingAll ? $t('settings.data.deleting') : $t('settings.data.deleteAllConfirm') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </section>

      <!-- À propos -->
      <section class="settings-section">
        <h3 class="section-label body-small">{{ $t('settings.about.title') }}</h3>
        <div class="settings-card">
          <div class="settings-row settings-row--wrap">
            <span class="row-text">
              <span class="row-title about-name">{{ $t('settings.about.version') }}</span>
              <span class="row-description body-small">{{ $t('settings.about.description') }}</span>
            </span>
            <div class="button-group">
              <BaseButton tag="a" href="https://github.com/leodurandfr/Reciper" variant="outline">
                GitHub
              </BaseButton>
              <BaseButton tag="a" href="https://www.leodurand.com" variant="outline">
                leodurand.com
              </BaseButton>
            </div>
          </div>
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
import Icon from './Icon.vue'
import { getSettings, saveSettings, applyTheme } from '../stores/settings.js'
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

const scrapeAnySite = ref(false)

// Load data each time the modal opens
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      const settings = await getSettings()
      theme.value = settings.theme
      language.value = settings.language ?? null
      scrapeAnySite.value = settings.scrapeAnySite
      recipeCount.value = await getRecipeCount()

      // Reset transient states
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

async function changeScrapeAnySite() {
  await saveSettings({ scrapeAnySite: scrapeAnySite.value })
}

</script>

<style scoped>
.settings-content {
  --color-danger: #c53030;
  --color-danger-hover: #9b2c2c;

  display: flex;
  flex-direction: column;
  gap: var(--space-06);
}

:global([data-theme="dark"]) .settings-content {
  --color-danger: #f06464;
  --color-danger-hover: #f58a8a;
}

/* === Sections === */

.section-label {
  color: var(--color-text-50);
  margin-bottom: var(--space-02);
  padding-left: var(--space-01);
}

.settings-card {
  background: var(--color-background-neutral);
  border-radius: var(--radius-04);
  overflow: hidden;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-05);
  padding: var(--space-04) var(--space-05);
}

.settings-row + .settings-row {
  border-top: 1px solid var(--color-border-strong);
}

.settings-row--wrap {
  flex-wrap: wrap;
}

.settings-row--stacked {
  display: block;
}

.settings-row--clickable {
  cursor: pointer;
}

.row-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-01);
  flex: 1 1 260px;
  min-width: 0;
}

.row-title {
  color: var(--color-text);
}

.row-description {
  color: var(--color-text-50);
}

.settings-row > .row-description {
  flex: 1 1 260px;
}

.row-description--danger {
  color: var(--color-danger);
}

.about-name {
  font-family: var(--font-family-heading);
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: var(--space-02);
  flex-wrap: wrap;
}

.button-group--end {
  justify-content: flex-end;
}

/* === Select === */

.select {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.select select {
  appearance: none;
  min-width: 160px;
  padding: var(--space-02) 36px var(--space-02) var(--space-04);
  font-size: var(--font-size-body-small);
  color: var(--color-brand);
  background: transparent;
  border: none;
  border-radius: var(--radius-03);
  box-shadow: inset 0 0 0 1px var(--color-border-strong);
  cursor: pointer;
  transition: box-shadow var(--transition-fast);
}

.select select:hover {
  box-shadow: inset 0 0 0 1.5px var(--color-brand);
}

.select select option {
  color: var(--color-text);
  background: var(--color-background-neutral);
}

.select-icon {
  position: absolute;
  right: var(--space-03);
  color: var(--color-brand);
  pointer-events: none;
}

/* === Switch === */

.switch {
  appearance: none;
  position: relative;
  flex-shrink: 0;
  width: 44px;
  height: 26px;
  border-radius: var(--radius-full);
  background: var(--color-border-strong);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition-spring);
}

.switch:checked {
  background: var(--color-brand);
}

.switch:checked::after {
  transform: translateX(18px);
}

/* === Data === */

.data-stats {
  display: flex;
  align-items: baseline;
  gap: var(--space-02);
}

.stat-number {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-heading-03);
  font-weight: 600;
  line-height: var(--line-height-heading);
  color: var(--color-brand);
}

.import-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-04);
  padding: var(--space-04);
  background: var(--color-background);
  border-radius: var(--radius-03);
}

.import-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-03);
}

.import-count {
  color: var(--color-brand);
}

.import-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-04);
  cursor: pointer;
}

.status-message {
  padding: var(--space-03) var(--space-04);
  border-radius: var(--radius-03);
}

.status-message--success {
  color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 10%, transparent);
}

.status-message--error {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
}

/* === Danger button === */

.danger-btn.base-btn--outline {
  color: var(--color-danger);
}

.danger-btn.base-btn--outline:hover:not(.base-btn--disabled) {
  box-shadow: inset 0 0 0 1.5px var(--color-danger);
}

.danger-btn.base-btn--fill {
  background-color: var(--color-danger);
  color: #fff;
}

.danger-btn.base-btn--fill:hover:not(.base-btn--disabled) {
  background-color: var(--color-danger-hover);
}

/* Mobile */
@media (max-width: 480px) {
  .settings-row {
    padding: var(--space-04);
  }

  .settings-row:not(.settings-row--clickable) {
    flex-wrap: wrap;
  }
}
</style>
