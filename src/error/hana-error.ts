import type { ErrorCategory, ErrorContext } from '@/types/error'
import { ErrorSeverity } from '@/types/error'

export class HanaError extends Error {
  public readonly code: string
  public readonly category: ErrorCategory
  public readonly severity: ErrorSeverity
  public readonly details?: Record<string, any> | undefined
  public readonly cause?: Error | undefined

  constructor(context: ErrorContext) {
    super(context.message)
    this.name = 'HanaError'
    this.code = context.code
    this.category = context.category
    this.severity = context.severity
    this.details = context.details
    this.cause = context.cause

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HanaError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      severity: this.severity,
      message: this.message,
      details: this.details,
      stack: this.stack,
      cause: this.cause?.message,
    }
  }

  isCategory(category: ErrorCategory) {
    return this.category === category
  }

  isAtLeastSeverity(severity: ErrorSeverity) {
    const severityOrder = [
      ErrorSeverity.LOW,
      ErrorSeverity.MEDIUM,
      ErrorSeverity.HIGH,
      ErrorSeverity.CRITICAL,
    ]
    return severityOrder.indexOf(this.severity) >= severityOrder.indexOf(severity)
  }
}
