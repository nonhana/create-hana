import { ErrorCategory } from '@/types/error'
import { HanaError } from './hana-error'

export function isErrorCode(error: unknown, code: string): boolean {
  return error instanceof HanaError && error.code === code
}

export function isErrorCategory(error: unknown, category: ErrorCategory): boolean {
  return error instanceof HanaError && error.category === category
}

export function getUserMessage(error: unknown): string {
  if (error instanceof HanaError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function shouldRetry(error: unknown): boolean {
  if (error instanceof HanaError) {
    return error.category === ErrorCategory.NETWORK
      || error.category === ErrorCategory.DEPENDENCY
  }
  return false
}
