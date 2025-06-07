export const PROJECTS = [{
  label: '普通 Node.js 项目',
  value: 'node',
}] as const

export type PROJECT_TYPES = typeof PROJECTS[number]['value']
