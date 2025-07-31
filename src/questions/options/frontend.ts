export const FRONTEND_BUILD_TOOLS_OPTIONS = [
  { label: 'Vite', value: 'vite' },
  // TODO: Add Rspack and Webpack
] as const

export const FRONTEND_CSS_FRAMEWORKS_OPTIONS = [
  { label: 'Tailwind CSS', value: 'tailwindcss' },
  { label: 'UnoCSS', value: 'unocss' },
  { label: 'None', value: 'none' },
] as const

export const FRONTEND_CSS_PREPROCESSORS_OPTIONS = [
  { label: 'None -> CSS', value: 'none' },
  { label: 'LESS', value: 'less' },
  { label: 'SCSS', value: 'scss' },
] as const

export const FRONTEND_HTTP_OPTIONS = [
  { label: 'Axios', value: 'axios' },
  { label: 'Ky', value: 'ky' },
  { label: 'None -> Native Fetch', value: 'none' },
] as const
