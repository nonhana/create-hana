import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateStateManagement(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  packageJson.dependencies = packageJson.dependencies || {}

  // Zustand Generator
  const generateZustandStore = () => `import { create } from 'zustand'

export const useStore = create()((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))
`

  // Jotai Generator
  const generateJotaiStore = () => `import { atom } from 'jotai'

export const countAtom = atom(1)

export const incAtom = atom(null, (get, set) => {
  set(countAtom, get(countAtom) + 1)
})
`

  // Mobx Generator
  const generateMobxStore = () => `import { makeAutoObservable } from 'mobx'

class CounterStore {
  count = 1

  constructor() {
    makeAutoObservable(this)
  }

  inc() {
    this.count += 1
  }
}

export const counterStore = new CounterStore()
`

  // Redux Generator
  const generateReduxCounter = () => `import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    count: 1,
  },
  reducers: {
    inc: (state) => {
      state.count += 1
    },
  },
})

export const { inc } = counterSlice.actions
export default counterSlice.reducer
`
  const generateReduxStore = () => `import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './modules/counter'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})
`

  switch (config.stateManagement) {
    case 'zustand': {
      packageJson.dependencies.zustand = '^5.0.6'
      context.files[`src/stores/counter.${context.fileExtension}`] = generateZustandStore()
      break
    }
    case 'jotai': {
      packageJson.dependencies.jotai = '^2.12.5'
      context.files[`src/atoms/counter.${context.fileExtension}`] = generateJotaiStore()
      break
    }
    case 'mobx': {
      packageJson.dependencies.mobx = '^6.13.7'
      context.files[`src/stores/counter.${context.fileExtension}`] = generateMobxStore()
      break
    }
    case 'redux': {
      packageJson.dependencies['@reduxjs/toolkit'] = '^2.8.2'
      packageJson.dependencies['react-redux'] = '^9.2.0'
      context.files[`src/stores/modules/counter.${context.fileExtension}`] = generateReduxCounter()
      context.files[`src/stores/index.${context.fileExtension}`] = generateReduxStore()
      context.mainEditor!.addImport('main', `import { Provider } from 'react-redux'`)
      context.mainEditor!.addImport('main', `import { store } from './stores'`)
      context.mainEditor!.addJsxProvider('Provider', { store: 'store' })
      break
    }
  }
}
