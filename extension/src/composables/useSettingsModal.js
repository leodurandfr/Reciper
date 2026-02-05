import { ref } from 'vue'

const isSettingsModalOpen = ref(false)

export function useSettingsModal() {
  function openSettings() {
    isSettingsModalOpen.value = true
  }

  function closeSettings() {
    isSettingsModalOpen.value = false
  }

  return {
    isSettingsModalOpen,
    openSettings,
    closeSettings,
  }
}
