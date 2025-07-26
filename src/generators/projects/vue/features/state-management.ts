import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateStateManagement(context: ProjectContext) {
  const { config, packageJson } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  if (!config.usePinia)
    return

  const fileExtension = context.fileExtension

  packageJson.dependencies = packageJson.dependencies || {}

  const generatePiniaStore = () => {
    return `import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(1)
  
  function increment() {
    count.value++
  }
  
  return {
    count,
    increment,
  }
})
`
  }

  packageJson.dependencies.pinia = '^3.0.0'

  context.files[`src/stores/counter${fileExtension}`] = generatePiniaStore()
}
