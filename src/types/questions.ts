/**
 * Question configuration system types
 */

import type { Config } from './index'

/**
 * Question type enumeration
 */
export type QuestionType = 'select' | 'multiselect' | 'confirm' | 'text'

/**
 * Condition for showing a question
 */
export interface QuestionCondition {
  /** Config field to check */
  field: keyof Config
  /** Expected value(s) */
  value: any | any[]
  /** Condition operator */
  operator?: 'eq' | 'neq' | 'in' | 'notIn'
}

/**
 * Option for select/multiselect questions
 */
export interface QuestionOption {
  label: string
  value: any
  description?: string
}

/**
 * Base question configuration
 */
export interface BaseQuestionConfig {
  /** Unique question ID */
  id: string
  /** Question type */
  type: QuestionType
  /** Question message */
  message: string
  /** Config field to store the answer */
  field: keyof Config
  /** Default value */
  defaultValue?: any
  /** Conditions for showing this question */
  when?: QuestionCondition[]
}

/**
 * Select question configuration
 */
export interface SelectQuestionConfig extends BaseQuestionConfig {
  type: 'select'
  options: QuestionOption[]
  /** Initial selected value */
  initialValue?: any
}

/**
 * Multi-select question configuration
 */
export interface MultiSelectQuestionConfig extends BaseQuestionConfig {
  type: 'multiselect'
  options: QuestionOption[]
  /** Initial selected values */
  initialValues?: any[]
  /** Minimum required selections */
  min?: number
  /** Maximum allowed selections */
  max?: number
}

/**
 * Confirm question configuration
 */
export interface ConfirmQuestionConfig extends BaseQuestionConfig {
  type: 'confirm'
  /** Initial value */
  initialValue?: boolean
}

/**
 * Text question configuration
 */
export interface TextQuestionConfig extends BaseQuestionConfig {
  type: 'text'
  /** Placeholder text */
  placeholder?: string
  /** Validation function */
  validate?: (value: string) => boolean | string
}

/**
 * Union of all question types
 */
export type QuestionConfig =
  | SelectQuestionConfig
  | MultiSelectQuestionConfig
  | ConfirmQuestionConfig
  | TextQuestionConfig

/**
 * Project type specific questions
 */
export interface ProjectQuestionsConfig {
  /** Project type identifier */
  projectType: string
  /** Questions for this project type */
  questions: QuestionConfig[]
}

/**
 * Complete question set configuration
 */
export interface QuestionsSetConfig {
  /** Common questions (before project type selection) */
  common: QuestionConfig[]
  /** Project type specific questions */
  projects: ProjectQuestionsConfig[]
  /** Final questions (run at the end) */
  final: QuestionConfig[]
}
