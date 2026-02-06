import { ref } from 'vue'

const isSearchOpen = ref(false)
const searchQuery = ref('')

export function useSearch() {
  const openSearch = () => {
    isSearchOpen.value = true
  }

  const closeSearch = () => {
    isSearchOpen.value = false
  }

  const clearSearch = () => {
    searchQuery.value = ''
  }

  return { isSearchOpen, searchQuery, openSearch, closeSearch, clearSearch }
}
