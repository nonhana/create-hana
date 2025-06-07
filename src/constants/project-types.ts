export const PROJECTS = [{
  label: 'Common Node.js',
  value: 'node',
}] as const

export type PROJECT_TYPES = typeof PROJECTS[number]['value']
