export const REACT_BUILD_TOOLS_OPTIONS = [
  { label: 'Vite', value: 'vite' },
  // { label: 'Rspack', value: 'rspack' },
  // { label: 'Webpack', value: 'webpack' },
] as const

export const REACT_CSS_FRAMEWORKS_OPTIONS = [
  { label: 'Tailwind CSS', value: 'tailwindcss' },
  { label: 'UnoCSS', value: 'unocss' },
  { label: 'None', value: 'none' },
] as const

export const REACT_CSS_PREPROCESSORS_OPTIONS = [
  { label: 'CSS', value: 'css' },
  { label: 'LESS', value: 'less' },
  { label: 'SCSS', value: 'scss' },
] as const

export const REACT_ROUTING_LIBRARIES_OPTIONS = [
  { label: 'React Router', value: 'react-router' },
  { label: 'TanStack Router', value: '@tanstack/react-router' },
  { label: 'Wouter', value: 'wouter' },
  { label: 'None', value: 'none' },
] as const

export const REACT_STATE_MANAGEMENT_OPTIONS = [
  { label: 'Zustand', value: 'zustand' },
  { label: 'Jotai', value: 'jotai' },
  { label: 'MobX', value: 'mobx' },
  { label: 'Redux', value: 'redux' },
  { label: 'None', value: 'none' },
] as const

export const REACT_HTTP_OPTIONS = [
  { label: 'Axios', value: 'axios' },
  { label: 'Ky', value: 'ky' },
  { label: 'None -> Native Fetch', value: 'none' },
] as const

export const REACT_QUERY_OPTIONS = [
  { label: 'React Query', value: 'react-query' },
  { label: 'SWR', value: 'swr' },
  { label: 'None', value: 'none' },
] as const

export const REACT_PATH_ALIASING_OPTIONS = [
  { label: '@/xxx', value: '@' },
  { label: '~/xxx', value: '~' },
  { label: 'None', value: 'none' },
] as const
