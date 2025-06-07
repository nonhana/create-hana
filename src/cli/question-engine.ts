import type {
  Config,
  QuestionCondition,
  QuestionConfig,
  QuestionsSetConfig,
} from '@/types'
import process from 'node:process'
import * as prompts from '@clack/prompts'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/utils/error'

export class QuestionEngine {
  private config: Config = {}
  private questionsConfig: QuestionsSetConfig

  constructor(questionsConfig: QuestionsSetConfig) {
    this.questionsConfig = questionsConfig
  }

  async run(initialConfig: Config = {}): Promise<Config> {
    this.config = { ...initialConfig }

    // Run common questions first
    await this.runQuestions(this.questionsConfig.common)

    // Run project-specific questions
    if (this.config.projectType) {
      const projectQuestions = this.questionsConfig.projects.find(
        p => p.projectType === this.config.projectType,
      )
      if (projectQuestions) {
        await this.runQuestions(projectQuestions.questions)
      }
    }

    // Run final questions
    await this.runQuestions(this.questionsConfig.final)

    return this.config as Config
  }

  private async runQuestions(questions: QuestionConfig[]): Promise<void> {
    for (const question of questions) {
      await this.runQuestion(question)
    }
  }

  private async runQuestion(question: QuestionConfig): Promise<void> {
    // Check if question should be shown
    if (!this.shouldShowQuestion(question)) {
      return
    }

    // Skip if value already exists in config
    if (this.config[question.field] !== undefined) {
      return
    }

    let answer: any

    try {
      switch (question.type) {
        case 'select':
          answer = await prompts.select({
            message: question.message,
            options: question.options,
            initialValue: question.initialValue || question.defaultValue,
          })
          break

        case 'multiselect':
          answer = await prompts.multiselect({
            message: question.message,
            options: question.options,
            initialValues: question.initialValues || question.defaultValue || [],
            required: question.min !== undefined ? question.min > 0 : false,
          })
          break

        case 'confirm':
          answer = await prompts.confirm({
            message: question.message,
            initialValue: question.initialValue ?? question.defaultValue ?? false,
          })
          break

        case 'text':
          answer = await prompts.text({
            message: question.message,
            ...(question.placeholder && { placeholder: question.placeholder }),
            ...(question.defaultValue && { defaultValue: question.defaultValue }),
            ...(question.validate && {
              validate: (value: string) => {
                const result = question.validate!(value)
                return typeof result === 'boolean' ? (result ? undefined : 'Invalid input') : result
              },
            }),
          })
          break

        default:
          throw ErrorFactory.configuration(
            `Unsupported question type: ${(question as any).type}`,
          )
      }

      // Check if user cancelled
      if (prompts.isCancel(answer)) {
        prompts.cancel(ErrorMessages.userInput.operationCancelled())
        process.exit(1)
      }

      // Store answer in config
      ;(this.config as any)[question.field] = answer
    }
    catch {
      throw ErrorFactory.userInput(
        `Failed to process question: ${question.id}`,
        { questionId: question.id, questionType: question.type },
      )
    }
  }

  private shouldShowQuestion(question: QuestionConfig): boolean {
    if (!question.when || question.when.length === 0) {
      return true
    }

    return question.when.every(condition => this.evaluateCondition(condition))
  }

  private evaluateCondition(condition: QuestionCondition): boolean {
    const currentValue = this.config[condition.field]
    const { value: expectedValue, operator = 'eq' } = condition

    switch (operator) {
      case 'eq':
        return currentValue === expectedValue

      case 'neq':
        return currentValue !== expectedValue

      case 'in':
        return Array.isArray(expectedValue)
          ? expectedValue.includes(currentValue)
          : currentValue === expectedValue

      case 'notIn':
        return Array.isArray(expectedValue)
          ? !expectedValue.includes(currentValue)
          : currentValue !== expectedValue

      default:
        throw ErrorFactory.configuration(
          `Unsupported condition operator: ${operator}`,
        )
    }
  }

  getCurrentConfig(): Config {
    return { ...this.config }
  }
}
