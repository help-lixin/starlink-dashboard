export const isCollapse = ref(false)
export const setCollapse = () => {
  isCollapse.value = !isCollapse.value
}

export const getCollapse = () => {
  return isCollapse.value
}
