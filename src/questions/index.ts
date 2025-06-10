import type { Config } from '@/types'
import { QUESTIONS_CONFIG } from '@/constants/questions-config'
import { QuestionEngine } from './engine'

export async function runQuestions(initialConfig: Config = {}) {
  const engine = new QuestionEngine(QUESTIONS_CONFIG)
  return engine.run(initialConfig)
}
