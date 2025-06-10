import type { ErrorContext } from '@/types/error'
import { HanaError } from '@/error/hana-error'
import { ErrorCategory, ErrorSeverity } from '@/types/error'

export class ErrorFactory {
  static validation(message: string, details?: Record<string, any>) {
    const context: ErrorContext = {
      code: 'VALIDATION_ERROR',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      message,
    }
    if (details !== undefined) {
      context.details = details
    }
    return new HanaError(context)
  }

  static fileSystem(message: string, details?: Record<string, any>, cause?: Error) {
    const context: ErrorContext = {
      code: 'FILE_SYSTEM_ERROR',
      category: ErrorCategory.FILE_SYSTEM,
      severity: ErrorSeverity.HIGH,
      message,
    }
    if (details !== undefined) {
      context.details = details
    }
    if (cause !== undefined) {
      context.cause = cause
    }
    return new HanaError(context)
  }

  static dependency(message: string, details?: Record<string, any>, cause?: Error) {
    const context: ErrorContext = {
      code: 'DEPENDENCY_ERROR',
      category: ErrorCategory.DEPENDENCY,
      severity: ErrorSeverity.HIGH,
      message,
    }
    if (details !== undefined) {
      context.details = details
    }
    if (cause !== undefined) {
      context.cause = cause
    }
    return new HanaError(context)
  }

  static configuration(message: string, details?: Record<string, any>) {
    const context: ErrorContext = {
      code: 'CONFIGURATION_ERROR',
      category: ErrorCategory.CONFIGURATION,
      severity: ErrorSeverity.HIGH,
      message,
    }
    if (details !== undefined) {
      context.details = details
    }
    return new HanaError(context)
  }

  static userInput(message: string, details?: Record<string, any>) {
    const context: ErrorContext = {
      code: 'USER_INPUT_ERROR',
      category: ErrorCategory.USER_INPUT,
      severity: ErrorSeverity.MEDIUM,
      message,
    }
    if (details !== undefined) {
      context.details = details
    }
    return new HanaError(context)
  }

  static system(message: string, details?: Record<string, any>, cause?: Error) {
    const context: ErrorContext = {
      code: 'SYSTEM_ERROR',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.CRITICAL,
      message,
    }
    if (details !== undefined) {
      context.details = details
    }
    if (cause !== undefined) {
      context.cause = cause
    }
    return new HanaError(context)
  }

  static network(message: string, details?: Record<string, any>, cause?: Error) {
    const context: ErrorContext = {
      code: 'NETWORK_ERROR',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      message,
    }
    if (details !== undefined) {
      context.details = details
    }
    if (cause !== undefined) {
      context.cause = cause
    }
    return new HanaError(context)
  }

  static wrap(error: unknown, message?: string) {
    if (error instanceof HanaError) {
      return error
    }

    const baseMessage = message || 'An unexpected error occurred'

    if (error instanceof Error) {
      return new HanaError({
        code: 'WRAPPED_ERROR',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        message: `${baseMessage}: ${error.message}`,
        cause: error,
      })
    }

    return new HanaError({
      code: 'UNKNOWN_ERROR',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      message: `${baseMessage}: ${String(error)}`,
      details: { originalError: error },
    })
  }
}
