import type { QuestionSituationObj } from '@/types'
import { describe, expect, it, vi } from 'vitest'
import { QUESTIONS_CONFIG } from '@/constants/questions-config'
import { runQuestions } from '..'

// Mock @clack/prompts
vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  text: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn(),
  intro: vi.fn(),
  outro: vi.fn(),
}))

// Mock question engine
vi.mock('../question-engine')

describe('questions system', () => {
  it('should have valid questions configuration', () => {
    expect(QUESTIONS_CONFIG).toBeDefined()
    expect(QUESTIONS_CONFIG.common).toBeInstanceOf(Array)
    expect(QUESTIONS_CONFIG.projects).toBeInstanceOf(Array)

    // Should have at least the basic questions
    expect(QUESTIONS_CONFIG.common.length).toBeGreaterThan(0)
    expect(QUESTIONS_CONFIG.projects.length).toBeGreaterThan(0)

    // Should have node project configuration
    const nodeProject = QUESTIONS_CONFIG.projects.find(p => p.projectType === 'node')
    expect(nodeProject).toBeDefined()
    expect(nodeProject?.questions.length).toBeGreaterThan(0)
  })

  it('should validate question structure', () => {
    // Check common questions structure
    for (const question of QUESTIONS_CONFIG.common) {
      expect(question).toHaveProperty('id')
      expect(question).toHaveProperty('type')
      expect(question).toHaveProperty('message')
      expect(question).toHaveProperty('field')
      expect(typeof question.id).toBe('string')
      expect(['select', 'multiselect', 'confirm', 'text']).toContain(question.type)
    }

    // Check project questions structure
    for (const project of QUESTIONS_CONFIG.projects) {
      expect(project).toHaveProperty('projectType')
      expect(project).toHaveProperty('questions')
      expect(Array.isArray(project.questions)).toBe(true)

      for (const question of project.questions) {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('message')
        expect(question).toHaveProperty('field')
      }
    }
  })

  it('should validate conditional questions', () => {
    const nodeProject = QUESTIONS_CONFIG.projects.find(p => p.projectType === 'node')
    expect(nodeProject).toBeDefined()

    // Find questions with conditions
    const conditionalQuestions = nodeProject!.questions.filter(q => q.when && q.when.situation.length > 0)

    for (const question of conditionalQuestions) {
      expect(question.when).toBeDefined()
      for (const condition of question.when!.situation as QuestionSituationObj[]) {
        expect(condition).toHaveProperty('field')
        expect(condition).toHaveProperty('value')
        expect(['eq', 'neq', 'in', 'notIn']).toContain(condition.operator || 'eq')
      }
    }
  })

  it('should export runQuestions function', () => {
    expect(typeof runQuestions).toBe('function')
  })
})
