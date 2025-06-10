import type {
  Config,
  QuestionConfig,
  QuestionSituationObj,
  QuestionsSetConfig,
} from '@/types'
import { existsSync } from 'node:fs'
import process from 'node:process'
import * as prompts from '@clack/prompts'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

// resolve process of questions
// each question corresponds to a field in config
export class QuestionEngine {
  private config: Config = {}
  private questionsConfig: QuestionsSetConfig

  constructor(questionsConfig: QuestionsSetConfig) {
    this.questionsConfig = questionsConfig
  }

  // public, questions' runner trigger
  async run(initialConfig: Config = {}) {
    this.config = { ...initialConfig }

    // 1. common
    await this.runQuestions(this.questionsConfig.common)

    // 2. project specially
    if (this.config.projectType) {
      const projectQuestions = this.questionsConfig.projects.find(
        p => p.projectType === this.config.projectType,
      )
      if (projectQuestions) {
        await this.runQuestions(projectQuestions.questions)
      }
    }

    // 3. final
    await this.runQuestions(this.questionsConfig.final)

    return this.config
  }

  private async runQuestions(questions: QuestionConfig[]) {
    for (const question of questions) {
      await this.runQuestion(question)
    }
  }

  // run a single question
  private async runQuestion(question: QuestionConfig) {
    if (!(await this.shouldShowQuestion(question))) {
      return
    }

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
            `Unsupported question type: ${(question as QuestionConfig).type}`,
          )
      }

      if (prompts.isCancel(answer)) {
        prompts.cancel(ErrorMessages.userInput.operationCancelled())
        process.exit(1)
      }

      await this.handleSpecialCase(question, answer)

      ;(this.config as any)[question.field] = answer
    }
    catch {
      throw ErrorFactory.userInput(
        `Failed to process question: ${question.id}`,
        { questionId: question.id, questionType: question.type },
      )
    }
  }

  // special case handler for some questions
  // especially for the 'static' question
  private async handleSpecialCase(question: QuestionConfig, answer: any) {
    if (question.field === 'removeExistFolder') {
      if (this.config.targetDir && existsSync(this.config.targetDir) && !answer) {
        throw ErrorFactory.validation(ErrorMessages.validation.targetDirExists())
      }
    }
  }

  // check if the question should be shown
  private async shouldShowQuestion(question: QuestionConfig) {
    if (!question.when) {
      return true
    }

    // the question is rely on the result of other questions
    if (question.when.type === 'cascade') {
      return question.when.situation.every(condition => this.evaluateCondition(condition))
    }

    // the question is rely on the current config or need some special logic
    return await question.when.situation(this.config)
  }

  // evaluate the condition of the question
  private evaluateCondition(condition: QuestionSituationObj) {
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
}
