export const PROJECTS = [
  {
    label: 'Common Node.js',
    value: 'node',
  },
  {
    label: 'Vue Application',
    value: 'vue',
  },
] as const

export type PROJECT_TYPES = typeof PROJECTS[number]['value']
