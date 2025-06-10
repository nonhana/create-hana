import type { QuestionsSetConfig } from '@/types'
import { describe, expect, it, vi } from 'vitest'
import { QuestionEngine } from '../engine'

// Mock @clack/prompts
vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  text: vi.fn(),
  isCancel: vi.fn(),
  cancel: vi.fn(),
}))

describe('questionEngine', () => {
  const testConfig: QuestionsSetConfig = {
    common: [
      {
        id: 'projectName',
        type: 'text',
        message: 'Project name:',
        field: 'targetDir',
        defaultValue: 'test-project',
      },
      {
        id: 'projectType',
        type: 'select',
        message: 'Project type:',
        field: 'projectType',
        options: [
          { label: 'Node.js', value: 'node' },
        ],
      },
    ],
    projects: [
      {
        projectType: 'node',
        questions: [
          {
            id: 'language',
            type: 'select',
            message: 'Language:',
            field: 'language',
            options: [
              { label: 'TypeScript', value: 'typescript' },
              { label: 'JavaScript', value: 'javascript' },
            ],
            initialValue: 'typescript',
          },
          {
            id: 'bundler',
            type: 'select',
            message: 'Bundler:',
            field: 'bundler',
            options: [
              { label: 'tsup', value: 'tsup' },
              { label: 'none', value: 'none' },
            ],
            when: {
              type: 'cascade',
              situation: [{
                field: 'language',
                value: 'typescript',
                operator: 'eq',
              }],
            },
          },
        ],
      },
    ],
    final: [],
  }

  it('should initialize with questions config', () => {
    const engine = new QuestionEngine(testConfig)
    expect(engine).toBeDefined()
  })

  it('should evaluate simple conditions correctly', () => {
    const engine = new QuestionEngine(testConfig)

    // Access private method for testing
    const evaluateCondition = (engine as any).evaluateCondition.bind(engine)

    // Set up test config
    ;(engine as any).config = { language: 'typescript' }

    expect(evaluateCondition({
      field: 'language',
      value: 'typescript',
      operator: 'eq',
    })).toBe(true)

    expect(evaluateCondition({
      field: 'language',
      value: 'javascript',
      operator: 'eq',
    })).toBe(false)
  })

  it('should evaluate "in" conditions correctly', () => {
    const engine = new QuestionEngine(testConfig)
    const evaluateCondition = (engine as any).evaluateCondition.bind(engine)

    ;(engine as any).config = { language: 'typescript' }

    expect(evaluateCondition({
      field: 'language',
      value: ['typescript', 'javascript'],
      operator: 'in',
    })).toBe(true)

    expect(evaluateCondition({
      field: 'language',
      value: ['python', 'go'],
      operator: 'in',
    })).toBe(false)
  })

  it('should check if question should be shown based on conditions', async () => {
    const engine = new QuestionEngine(testConfig)
    const shouldShowQuestion = (engine as any).shouldShowQuestion.bind(engine)

    ;(engine as any).config = { language: 'typescript' }

    const question = {
      id: 'test',
      type: 'select' as const,
      message: 'Test',
      field: 'test' as const,
      options: [],
      when: {
        type: 'cascade',
        situation: [{
          field: 'language' as const,
          value: 'typescript',
          operator: 'eq' as const,
        }],
      },
    }

    expect((await shouldShowQuestion(question))).toBe(true)

    ;(engine as any).config = { language: 'javascript' }
    expect((await shouldShowQuestion(question))).toBe(false)
  })
})
