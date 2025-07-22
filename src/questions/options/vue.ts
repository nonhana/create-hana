export const VUE_BUILD_TOOLS_OPTIONS = [
  { label: 'Vite', value: 'vite' },
  // { label: 'Rspack', value: 'rspack' },
  // { label: 'Webpack', value: 'webpack' },
] as const

export const VUE_CSS_FRAMEWORKS_OPTIONS = [
  { label: 'Tailwind CSS', value: 'tailwindcss' },
  { label: 'UnoCSS', value: 'unocss' },
  { label: 'None', value: 'none' },
] as const

export const VUE_CSS_PREPROCESSORS_OPTIONS = [
  { label: 'None -> CSS', value: 'none' },
  { label: 'LESS', value: 'less' },
  { label: 'SCSS', value: 'scss' },
] as const

export const VUE_ROUTING_LIBRARIES_OPTIONS = [
  { label: 'Vue Router', value: 'vue-router' },
  { label: 'None', value: 'none' },
] as const

export const VUE_STATE_MANAGEMENT_OPTIONS = [
  { label: 'Pinia', value: 'pinia' },
  { label: 'Vuex', value: 'vuex' },
  { label: 'None', value: 'none' },
] as const

export const VUE_HTTP_OPTIONS = [
  { label: 'Axios', value: 'axios' },
  { label: 'Ky', value: 'ky' },
  { label: 'None -> Native Fetch', value: 'none' },
] as const

export const VUE_PATH_ALIASING_OPTIONS = [
  { label: '@/xxx', value: '@' },
  { label: '~/xxx', value: '~' },
  { label: 'None', value: 'none' },
] as const
