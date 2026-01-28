<template>
  <div class="col-full settings-view">
    <h1 class="heading-02">Paramètres</h1>

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
        <button
          @click="testConnection"
          :disabled="testing"
          class="btn-secondary"
        >
          {{ testing ? 'Test...' : 'Tester' }}
        </button>
      </div>

      <div v-if="connectionStatus" :class="['status-message', connectionStatus.type]">
        {{ connectionStatus.message }}
      </div>

      <button @click="saveBackendUrl" :disabled="saving" class="btn-primary">
        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
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
        <button @click="handleExport" :disabled="exporting" class="btn-secondary">
          {{ exporting ? 'Export...' : 'Exporter mes recettes' }}
        </button>

        <label class="btn-secondary import-btn">
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
          <button @click="confirmImport" :disabled="importing" class="btn-primary">
            {{ importing ? 'Import...' : 'Confirmer l\'import' }}
          </button>
          <button @click="cancelImport" class="btn-secondary">Annuler</button>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSettings, saveSettings, testBackendConnection, applyTheme } from '../stores/settings.js'
import { getRecipeCount } from '../services/db.js'
import { downloadRecipesExport, previewImportFile, importRecipesFromFile } from '../services/exportImport.js'

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

onMounted(async () => {
  const settings = await getSettings()
  backendUrl.value = settings.backendUrl
  theme.value = settings.theme
  autoOpenRecipe.value = settings.autoOpenRecipe

  recipeCount.value = await getRecipeCount()
})

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
.settings-view {
  max-width: 600px;
  padding: var(--space-04) 0;
}

.settings-section {
  background: var(--color-background-neutral);
  border-radius: var(--radius-02);
  padding: var(--space-05);
  margin-bottom: var(--space-05);
}

.settings-section h2 {
  margin-bottom: var(--space-02);
}

.settings-section p {
  margin-bottom: var(--space-04);
}

.text-muted {
  color: var(--color-text-subdued);
}

.input-group {
  display: flex;
  gap: var(--space-03);
  margin-bottom: var(--space-04);
}

.input-url {
  flex: 1;
}

.btn-secondary {
  background-color: var(--color-background-contrast);
  color: var(--color-text-contrast);
  padding: var(--space-03) var(--space-04);
  border-radius: var(--radius-01);
  transition: opacity var(--transition-fast);
  cursor: pointer;
  border: none;
}

.btn-secondary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-message {
  padding: var(--space-03);
  border-radius: var(--radius-01);
  margin-bottom: var(--space-04);
  font-size: var(--font-size-body-small);
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
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
  color: var(--color-text-subdued);
}

.button-group {
  display: flex;
  gap: var(--space-03);
  flex-wrap: wrap;
}

.import-btn {
  cursor: pointer;
}

.import-preview {
  background: var(--color-background);
  border: 1px solid var(--color-border);
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
