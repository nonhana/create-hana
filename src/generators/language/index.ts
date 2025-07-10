import type { Generator } from '@/types'
import { generateNodeJSConfig, generateNodeTSConfig } from './configs/node'
import { generateReactTSConfig } from './configs/react'

export const languageGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'

    switch (config.projectType) {
      case 'node': {
        if (language === 'typescript')
          generateNodeTSConfig(context)
        else
          generateNodeJSConfig(context)
        break
      }
      case 'react': {
        if (language === 'typescript')
          generateReactTSConfig(context)
        break
      }
    }
  },
}
