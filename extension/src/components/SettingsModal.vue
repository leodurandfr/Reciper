<template>
  <BaseModal :open="isOpen" title="Paramètres" @close="$emit('close')">
    <div class="settings-content">
      <!-- Backend URL -->
      <section class="settings-section">
        <h2 class="heading-03">Serveur de scraping</h2>
        <p class="body-small text-muted">URL du backend qui extrait les recettes des sites web.</p>

        <div class="input-group">
          <input
            v-model="backendUrl"
            type="url"
            placeholder="https://api-reciper.leodurand.com"
            class="input-url"
          >
          <BaseButton variant="outline" :disabled="testing" @click="testConnection">
            {{ testing ? 'Test...' : 'Tester' }}
          </BaseButton>
        </div>

        <div v-if="connectionStatus" :class="['status-message', connectionStatus.type]">
          {{ connectionStatus.message }}
        </div>

        <BaseButton variant="fill" :disabled="saving" @click="saveBackendUrl">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </BaseButton>
      </section>

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

          <label class="import-btn">
            Importer des recettes
            <input
              type="file"
              accept=".json"
              @change="handleImportFile"
              style="display: none;"
            >
          </label>
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

      <!-- Comportement -->
      <section class="settings-section">
        <h2 class="heading-03">Comportement</h2>

        <label class="toggle-option">
          <input
            type="checkbox"
            v-model="autoOpenRecipe"
            @change="changeAutoOpenRecipe"
          >
          <div class="toggle-content">
            <span class="toggle-label">Ouvrir automatiquement les recettes</span>
            <span class="toggle-description text-muted">Accéder directement à la recette dans Reciper après le scraping, sans afficher la notification.</span>
          </div>
        </label>
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
          Reciper v2.0.0<br>
          Chrome extension to save your favorite recipes.
        </p>
      </section>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import { getSettings, saveSettings, testBackendConnection, applyTheme } from '../stores/settings.js'
import { getRecipeCount } from '../services/db.js'
import { downloadRecipesExport, previewImportFile, importRecipesFromFile } from '../services/exportImport.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const backendUrl = ref('')
const testing = ref(false)
const saving = ref(false)
const connectionStatus = ref(null)

const recipeCount = ref(0)
const exporting = ref(false)
const importing = ref(false)
const importPreview = ref(null)
const importFile = ref(null)
const importOverwrite = ref(false)
const importResult = ref(null)

const theme = ref('system')
const autoOpenRecipe = ref(false)
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
      backendUrl.value = settings.backendUrl
      theme.value = settings.theme
      autoOpenRecipe.value = settings.autoOpenRecipe
      recipeCount.value = await getRecipeCount()

      // Reset transient states
      connectionStatus.value = null
      importPreview.value = null
      importFile.value = null
      importResult.value = null
    }
  },
  { immediate: true }
)

async function testConnection() {
  testing.value = true
  connectionStatus.value = null

  try {
    const isOk = await testBackendConnection(backendUrl.value)
    connectionStatus.value = {
      type: isOk ? 'success' : 'error',
      message: isOk ? 'Connexion réussie !' : 'Impossible de se connecter au serveur'
    }
  } catch {
    connectionStatus.value = {
      type: 'error',
      message: 'Erreur lors du test de connexion'
    }
  } finally {
    testing.value = false
  }
}

async function saveBackendUrl() {
  saving.value = true
  try {
    await saveSettings({ backendUrl: backendUrl.value })
    connectionStatus.value = {
      type: 'success',
      message: 'URL enregistrée'
    }
  } catch {
    connectionStatus.value = {
      type: 'error',
      message: 'Erreur lors de l\'enregistrement'
    }
  } finally {
    saving.value = false
  }
}

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

function cancelImport() {
  importPreview.value = null
  importFile.value = null
}

async function changeTheme() {
  await saveSettings({ theme: theme.value })
  applyTheme(theme.value)
}

async function changeAutoOpenRecipe() {
  await saveSettings({ autoOpenRecipe: autoOpenRecipe.value })
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

.input-group {
  display: flex;
  gap: var(--space-03);
  margin-bottom: var(--space-04);
}

.input-url {
  flex: 1;
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

.import-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-02);
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);
  font-family: var(--font-family-body);
  letter-spacing: var(--letter-spacing-body);
  line-height: var(--line-height-body);
  font-size: var(--font-size-body-small);
  padding: var(--space-02) var(--space-04);
  border-radius: var(--radius-01);
  background-color: transparent;
  color: var(--color-brand);
  box-shadow: inset 0 0 0 1px var(--color-border-strong);
}

.import-btn:hover {
  box-shadow: inset 0 0 0 1px var(--color-brand);
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

.toggle-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-03);
  cursor: pointer;
}

.toggle-option input[type="checkbox"] {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.toggle-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-01);
}

.toggle-label {
  font-weight: 500;
}

.toggle-description {
  font-size: var(--font-size-body-small);
}
</style>
