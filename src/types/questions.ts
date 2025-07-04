import type { AllKeys, Config } from './index'
import type { PROJECT_TYPES } from '@/constants/project-types'

export type QuestionType = 'select' | 'multiselect' | 'confirm' | 'text'

export interface QuestionSituationObj {
  field: AllKeys<Config>
  value: any | any[]
  operator?: 'eq' | 'neq' | 'in' | 'notIn'
}

export type QuestionSituationFn = (config?: Config) => boolean | Promise<boolean>

export type QuestionSituation = QuestionSituationObj | QuestionSituationFn

export type QuestionCondition
  = | {
    type: 'cascade'
    situation: QuestionSituationObj[]
  }
  | {
    type: 'static'
    situation: QuestionSituationFn
  }

export interface QuestionOption {
  label: string
  value: any
  description?: string
}

export interface BaseQuestionConfig {
  id: string
  type: QuestionType
  message: string
  field: AllKeys<Config>
  defaultValue?: any
  when?: QuestionCondition
}

export interface SelectQuestionConfig extends BaseQuestionConfig {
  type: 'select'
  options: QuestionOption[]
  initialValue?: any
}

export interface MultiSelectQuestionConfig extends BaseQuestionConfig {
  type: 'multiselect'
  options: QuestionOption[]
  initialValues?: any[]
  min?: number
  max?: number
}

export interface ConfirmQuestionConfig extends BaseQuestionConfig {
  type: 'confirm'
  initialValue?: boolean
}

export interface TextQuestionConfig extends BaseQuestionConfig {
  type: 'text'
  placeholder?: string
  validate?: (value: string) => boolean | string
}

export type QuestionConfig
  = | SelectQuestionConfig
    | MultiSelectQuestionConfig
    | ConfirmQuestionConfig
    | TextQuestionConfig

export interface ProjectQuestionsConfig {
  projectType: PROJECT_TYPES
  questions: QuestionConfig[]
}

export interface QuestionsSetConfig {
  common: QuestionConfig[]
  projects: ProjectQuestionsConfig[]
  final: QuestionConfig[]
}
