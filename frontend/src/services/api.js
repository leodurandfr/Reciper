import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function getRecipes(favoritesOnly = false) {
  const params = favoritesOnly ? { favorites: true } : {}
  const response = await api.get('/recipes', { params })
  return response.data
}

export async function getRecipe(id) {
  const response = await api.get(`/recipes/${id}`)
  return response.data
}

export async function createRecipe(url) {
  const response = await api.post('/recipes', { url })
  return response.data
}

export async function deleteRecipe(id) {
  const response = await api.delete(`/recipes/${id}`)
  return response.data
}

export async function toggleFavorite(id) {
  const response = await api.patch(`/recipes/${id}/favorite`)
  return response.data
}

export async function updateRecipe(id, data) {
  const response = await api.patch(`/recipes/${id}`, data)
  return response.data
}

export default api
