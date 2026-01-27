/**
 * Service de compression d'images côté client
 * Utilise Canvas API pour redimensionner et compresser les images
 */

const MAX_WIDTH = 800
const MAX_HEIGHT = 800
const QUALITY = 0.8
const OUTPUT_TYPE = 'image/webp'

/**
 * Charge une image depuis une URL et retourne un blob compressé
 * @param {string} url - L'URL de l'image à charger
 * @returns {Promise<Blob|null>} Le blob compressé ou null si erreur
 */
export async function compressImageFromUrl(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const blob = await response.blob()
    return compressImageBlob(blob)
  } catch (error) {
    console.warn('Erreur lors du chargement de l\'image:', error)
    return null
  }
}

/**
 * Compresse un blob d'image
 * @param {Blob} blob - Le blob de l'image originale
 * @returns {Promise<Blob>} Le blob compressé
 */
export async function compressImageBlob(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Calculer les nouvelles dimensions
        let { width, height } = img
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height)
          height = MAX_HEIGHT
        }

        canvas.width = width
        canvas.height = height

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir en blob
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              resolve(compressedBlob)
            } else {
              reject(new Error('Échec de la compression'))
            }
          },
          OUTPUT_TYPE,
          QUALITY
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Échec du chargement de l\'image'))

    // Charger l'image depuis le blob
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Compresse une image depuis un input file
 * @param {File} file - Le fichier image
 * @returns {Promise<Blob>} Le blob compressé
 */
export async function compressImageFile(file) {
  // Vérifier que c'est bien une image
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier n\'est pas une image')
  }

  return compressImageBlob(file)
}

/**
 * Crée une URL de données (data URL) depuis un blob
 * @param {Blob} blob - Le blob à convertir
 * @returns {Promise<string>} La data URL
 */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Crée une URL d'objet pour affichage temporaire
 * N'oubliez pas d'appeler URL.revokeObjectURL() après utilisation
 * @param {Blob} blob - Le blob
 * @returns {string} L'URL d'objet
 */
export function createObjectUrl(blob) {
  return URL.createObjectURL(blob)
}

/**
 * Libère une URL d'objet
 * @param {string} url - L'URL à libérer
 */
export function revokeObjectUrl(url) {
  URL.revokeObjectURL(url)
}
