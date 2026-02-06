import { ref, nextTick } from 'vue'

// Store scroll positions per route path
const scrollPositions = ref(new Map())

// Track if we should restore scroll on next navigation
let shouldRestore = false

export function useScrollPosition() {
  /**
   * Save current scroll position for a route
   */
  function savePosition(routePath) {
    const position = window.scrollY
    scrollPositions.value.set(routePath, position)
  }

  /**
   * Get saved position for a route (and clear it)
   */
  function getSavedPosition(routePath) {
    const position = scrollPositions.value.get(routePath)
    return position ?? 0
  }

  /**
   * Restore scroll position for a route
   * Uses nextTick to ensure DOM is updated before scrolling
   */
  async function restorePosition(routePath) {
    const shouldRestoreNow = shouldRestore
    const position = shouldRestoreNow ? getSavedPosition(routePath) : 0
    shouldRestore = false

    // Wait for Vue to update the DOM with new content
    await nextTick()

    // Additional frame to ensure layout is complete
    requestAnimationFrame(() => {
      window.scrollTo({ top: position, behavior: 'instant' })
    })
  }

  /**
   * Mark that next navigation should restore scroll
   * (called when going back in history)
   */
  function markForRestore() {
    shouldRestore = true
  }

  /**
   * Scroll to top (used during transitions)
   */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return {
    savePosition,
    restorePosition,
    markForRestore,
    scrollToTop,
    scrollPositions,
  }
}
