import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { createAndEditVueFile } from '@/editor/features/helper'
import { ErrorFactory } from '@/error/factory'

export function generateStateManagement(context: ProjectContext) {
  const { config, packageJson } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  if (!config.usePinia) {
    return
  }

  const language = config.language ?? 'typescript'
  const fileExtension = context.fileExtension || '.ts'

  packageJson.dependencies = packageJson.dependencies || {}

  const generatePiniaStore = (language: 'typescript' | 'javascript') => {
    if (language === 'typescript') {
      return `import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref<number>(1)
  
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
    else {
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
  }

  const generateCounter = () => {
    return `<script setup lang="ts">
import { useCounterStore } from '../stores/counter'

const counter = useCounterStore()
</script>
    
<template>
  <div class="counter">
    <h2>Pinia Counter Store Example</h2>
    <div class="info">
      <p>Count: <strong>{{ counter.count }}</strong></p>
    </div>
    
    <div class="buttons">
      <button @click="counter.increment()">+1</button>
    </div>
  </div>
</template>

<style scoped>
.counter {
  text-align: center;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.info {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.buttons {
  margin: 1.5rem 0;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  padding: 0.7rem 1.2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

button:hover {
  background-color: #369870;
  transform: translateY(-1px);
}
</style>
`
  }

  packageJson.dependencies.pinia = '^3.0.0'

  context.files[`src/stores/counter${fileExtension}`] = generatePiniaStore(language)

  context.files['src/components/CounterExample.vue'] = createAndEditVueFile(generateCounter(), config)
}
