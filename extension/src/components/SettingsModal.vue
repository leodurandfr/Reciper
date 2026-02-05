<template>
  <BaseModal :open="isOpen" title="Paramètres" @close="$emit('close')">
    <div class="settings-content">
      <!-- Export/Import -->
      <section class="settings-section">
        <h2 class="heading-03">Données</h2>
        <p class="body-small text-muted">Exportez vos recettes pour les sauvegarder ou les transférer.</p>

        <div class="data-stats">
          <span class="stat-number">{{ recipeCount }}</span>
          <span class="stat-label">recettes enregistrées</span>
        </div>

        <div class="button-group">
          <BaseButton variant="outline" :disabled="exporting" @click="handleExport">
            {{ exporting ? 'Export...' : 'Exporter mes recettes' }}
          </BaseButton>

          <BaseButton variant="outline" @click="triggerImport">
            Importer des recettes
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
          <h4>Aperçu de l'import</h4>
          <p>{{ importPreview.recipeCount }} recettes à importer</p>
          <p class="text-muted">Version: {{ importPreview.version }}</p>

          <div class="import-options">
            <label>
              <input type="checkbox" v-model="importOverwrite">
              Écraser les recettes existantes (même URL)
            </label>
          </div>

          <div class="button-group">
            <BaseButton variant="fill" :disabled="importing" @click="confirmImport">
              {{ importing ? 'Import...' : 'Confirmer l\'import' }}
            </BaseButton>
            <BaseButton variant="outline" @click="cancelImport">Annuler</BaseButton>
          </div>
        </div>

        <div v-if="importResult" :class="['status-message', importResult.type]">
          {{ importResult.message }}
        </div>
      </section>

      <!-- Thème -->
      <section class="settings-section">
        <h2 class="heading-03">Apparence</h2>

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

      <!-- À propos -->
      <section class="settings-section">
        <h2 class="heading-03">À propos</h2>
        <p class="body-small text-muted">
          <span class="version-tap" @click="onVersionTap">Reciper v1.0.0</span><br>
          Save recipes automatically from 600+ cooking websites.
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
        <h2 class="heading-03">Serveur</h2>
        <p class="body-small text-muted">URL du backend de scraping.</p>

        <div class="dev-url-group">
          <input
            v-model="backendUrl"
            type="url"
            :placeholder="defaultUrl"
            class="dev-url-input"
          >
          <BaseButton variant="fill" :disabled="saving" @click="saveBackendUrl">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
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
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import { getSettings, saveSettings, applyTheme, BACKEND_URL } from '../stores/settings.js'
import { getRecipeCount } from '../services/db.js'
import { downloadRecipesExport, previewImportFile, importRecipesFromFile } from '../services/exportImport.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const recipeCount = ref(0)
const exporting = ref(false)
const importing = ref(false)
const importPreview = ref(null)
const importInput = ref(null)
const importFile = ref(null)
const importOverwrite = ref(false)
const importResult = ref(null)

const theme = ref('system')

// Hidden dev settings (tap version 5x to reveal)
const devTapCount = ref(0)
const showDevSettings = ref(false)
const backendUrl = ref('')
const saving = ref(false)
const backendStatus = ref(null)
const defaultUrl = BACKEND_URL

const themeOptions = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Système' },
]

// Load data each time the modal opens
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      const settings = await getSettings()
      theme.value = settings.theme
      recipeCount.value = await getRecipeCount()

      backendUrl.value = settings.backendUrl || ''

      // Reset transient states
      devTapCount.value = 0
      showDevSettings.value = false
      backendStatus.value = null
      importPreview.value = null
      importFile.value = null
      importResult.value = null
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
        message: `${result.count} recettes exportées`
      }
    }
  } catch (error) {
    importResult.value = {
      type: 'error',
      message: 'Erreur lors de l\'export: ' + error.message
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
        message: 'Fichier invalide: ' + preview.error
      }
    }
  } catch (error) {
    importResult.value = {
      type: 'error',
      message: 'Erreur lors de la lecture du fichier'
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
      message: `${result.imported} recettes importées, ${result.skipped} ignorées`
    }

    recipeCount.value = await getRecipeCount()
    importPreview.value = null
    importFile.value = null
  } catch (error) {
    importResult.value = {
      type: 'error',
      message: 'Erreur lors de l\'import: ' + error.message
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

async function changeTheme() {
  await saveSettings({ theme: theme.value })
  applyTheme(theme.value)
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
      message: url ? 'URL enregistrée' : 'URL réinitialisée (défaut)'
    }
  } catch {
    backendStatus.value = {
      type: 'error',
      message: 'Erreur lors de l\'enregistrement'
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
