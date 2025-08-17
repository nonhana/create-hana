import type { Generator } from '@/types'
import { getFileExtension } from '@/utils/template'
import { generateHonoTSConfig } from './configs/hono'
import { generateNodeJSConfig, generateNodeTSConfig } from './configs/node'
import { generateReactTSConfig } from './configs/react'
import { generateVueTSConfig } from './configs/vue'

export const languageGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'
    context.fileExtension = getFileExtension(language)

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
      case 'vue': {
        if (language === 'typescript')
          generateVueTSConfig(context)
        break
      }
      case 'hono': {
        if (language === 'typescript')
          generateHonoTSConfig(context)
        break
      }
      default: {
        // Default to Node.js language scaffolding when projectType is not specified
        if (language === 'typescript')
          generateNodeTSConfig(context)
        else
          generateNodeJSConfig(context)
      }
    }
  },
}
