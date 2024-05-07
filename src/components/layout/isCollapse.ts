// @ts-nocheck

if (window.localStorage.getItem('isCollapse') === undefined || window.localStorage.getItem('isCollapse') === null) {
  window.localStorage.setItem('isCollapse', false);
}
console.log(window.localStorage.getItem('isCollapse'), 'window.localStorage.getItem(\'isCollapse\')')
const getVal = {
  true: true,
  false: false
}
export const isCollapse = ref(getVal[window.localStorage.getItem('isCollapse')])
export const setCollapse = () => {
  // 存到本地
  isCollapse.value = !isCollapse.value
  console.log(isCollapse.value, 'is')
  window.localStorage.setItem('isCollapse',isCollapse.value);
}

export const getCollapse = () => {
  return isCollapse.value
}
