import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencyPreset } from '@/utils/package-json'

export function generateStateManagement(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  if (!config.usePinia)
    return

  const fileExtension = context.fileExtension

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

  addDependencyPreset(context.packageJson, 'feature.vue.state.pinia')

  context.files[`src/stores/counter${fileExtension}`] = generatePiniaStore()
}
