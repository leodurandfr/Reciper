// Illustrations d'ingrédients embarquées dans l'extension, indexées par image_id (nom du fichier)
export const ingredientImages = Object.fromEntries(
  Object.entries(
    import.meta.glob('./ingredients/*.png', { eager: true, import: 'default' })
  ).map(([path, url]) => [path.split('/').pop().replace('.png', ''), url])
)
