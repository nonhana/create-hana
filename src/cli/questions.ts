import type { Config } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { QUESTIONS_CONFIG } from '@/constants/questions-config'
import { ErrorFactory } from '@/utils/error'
import { QuestionEngine } from './question-engine'

export async function runQuestions(initialConfig: Config = {}): Promise<Config> {
  const engine = new QuestionEngine(QUESTIONS_CONFIG)
  return engine.run(initialConfig)
}

export async function furtherQuestions(config: Config): Promise<void> {
  if (!config.projectType) {
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  }

  const engine = new QuestionEngine(QUESTIONS_CONFIG)

  // Extract project-specific questions only
  const projectQuestions = QUESTIONS_CONFIG.projects.find(
    p => p.projectType === config.projectType,
  )

  if (projectQuestions) {
    // Run project-specific questions and merge results
    const projectConfig = await engine.run(config)
    Object.assign(config, projectConfig)
  }
}
