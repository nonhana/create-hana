export const PROJECTS = [{
  label: 'Common Node.js',
  value: 'node',
}, {
  label: 'React',
  value: 'react',
}, {
  label: 'Vue',
  value: 'vue',
}] as const

export type PROJECT_TYPES = typeof PROJECTS[number]['value']
