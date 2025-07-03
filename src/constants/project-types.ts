export const PROJECTS = [{
  label: 'Common Node.js',
  value: 'node',
}, {
  label: 'React',
  value: 'react',
}] as const

export type PROJECT_TYPES = typeof PROJECTS[number]['value']
