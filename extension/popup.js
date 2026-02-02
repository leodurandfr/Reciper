import { isSupportedSite } from './supported-sites.js'

const recipeCountEl = document.getElementById('recipeCount')
const openAppBtn = document.getElementById('openApp')
const addCurrentBtn = document.getElementById('addCurrent')
const statusEl = document.getElementById('status')

// Charger le nombre de recettes depuis chrome.storage.local
async function loadRecipeCount() {
  try {
    const result = await chrome.storage.local.get('recipes_index')
    const index = result.recipes_index || { ids: [] }
    recipeCountEl.textContent = index.ids.length
  } catch (error) {
    console.error('Erreur storage:', error)
    recipeCountEl.textContent = '0'
  }
}

// Vérifier si la page actuelle est un site de recette supporté
async function checkCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.url) return

    const url = new URL(tab.url)
    if (isSupportedSite(url.hostname)) {
      addCurrentBtn.disabled = false
      addCurrentBtn.dataset.url = tab.url
    }
  } catch (error) {
    console.error('Erreur vérification page:', error)
  }
}

// Ouvrir l'application principale
openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
  window.close()
})

// Ajouter la page actuelle
addCurrentBtn.addEventListener('click', async () => {
  const url = addCurrentBtn.dataset.url
  if (!url) return

  showStatus('Scraping en cours...', 'info')
  addCurrentBtn.disabled = true

  try {
    // Envoyer un message au service worker pour scraper
    const response = await chrome.runtime.sendMessage({
      type: 'SCRAPE_AND_SAVE',
      url: url
    })

    if (response.success) {
      showStatus('Recette ajoutée !', 'success')
      loadRecipeCount()

      // Ouvrir la recette après un court délai
      setTimeout(() => {
        chrome.tabs.create({
          url: chrome.runtime.getURL(`index.html#/recipe/${response.recipeId}`)
        })
        window.close()
      }, 1000)
    } else {
      showStatus(response.error || 'Erreur lors de l\'ajout', 'error')
      addCurrentBtn.disabled = false
    }
  } catch (error) {
    showStatus('Erreur: ' + error.message, 'error')
    addCurrentBtn.disabled = false
  }
})

function showStatus(message, type) {
  statusEl.textContent = message
  statusEl.className = 'status ' + type
  statusEl.style.display = 'block'
}

// Initialisation
loadRecipeCount()
checkCurrentPage()
