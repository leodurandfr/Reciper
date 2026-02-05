import { shallowRef } from 'vue'

const leftButton = shallowRef(null)
const rightButton = shallowRef(null)

export function useHeaderButtons() {
  return { leftButton, rightButton }
}
