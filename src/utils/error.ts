import process from 'node:process'
import { logger } from './logger'

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for better classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  FILE_SYSTEM = 'file_system',
  NETWORK = 'network',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration',
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
}

/**
 * Base error interface
 */
export interface ErrorContext {
  code: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  details?: Record<string, any> | undefined
  cause?: Error | undefined
}

/**
 * Custom error class for create-hana
 */
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

    // Ensure proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HanaError)
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, any> {
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

  /**
   * Check if error is of specific category
   */
  isCategory(category: ErrorCategory): boolean {
    return this.category === category
  }

  /**
   * Check if error severity is at least the specified level
   */
  isAtLeastSeverity(severity: ErrorSeverity): boolean {
    const severityOrder = [
      ErrorSeverity.LOW,
      ErrorSeverity.MEDIUM,
      ErrorSeverity.HIGH,
      ErrorSeverity.CRITICAL,
    ]
    return severityOrder.indexOf(this.severity) >= severityOrder.indexOf(severity)
  }
}

/**
 * Error factory for creating standardized errors
 */
export class ErrorFactory {
  /**
   * Create a validation error
   */
  static validation(message: string, details?: Record<string, any>): HanaError {
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

  /**
   * Create a file system error
   */
  static fileSystem(message: string, details?: Record<string, any>, cause?: Error): HanaError {
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

  /**
   * Create a dependency error
   */
  static dependency(message: string, details?: Record<string, any>, cause?: Error): HanaError {
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

  /**
   * Create a configuration error
   */
  static configuration(message: string, details?: Record<string, any>): HanaError {
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

  /**
   * Create a user input error
   */
  static userInput(message: string, details?: Record<string, any>): HanaError {
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

  /**
   * Create a system error
   */
  static system(message: string, details?: Record<string, any>, cause?: Error): HanaError {
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

  /**
   * Create a network error
   */
  static network(message: string, details?: Record<string, any>, cause?: Error): HanaError {
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

  /**
   * Wrap an unknown error
   */
  static wrap(error: unknown, message?: string): HanaError {
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

/**
 * Error handler for graceful error management
 */
export class ErrorHandler {
  /**
   * Handle error with appropriate logging and user feedback
   */
  static handle(error: unknown, context?: string): never {
    const hanaError = error instanceof HanaError ? error : ErrorFactory.wrap(error)

    // Log the error based on severity
    switch (hanaError.severity) {
      case ErrorSeverity.LOW:
        logger.warn(`${context ? `[${context}] ` : ''}${hanaError.message}`)
        break
      case ErrorSeverity.MEDIUM:
        logger.warn(`${context ? `[${context}] ` : ''}${hanaError.message}`)
        if (hanaError.details) {
          logger.warn(`Details: ${JSON.stringify(hanaError.details, null, 2)}`)
        }
        break
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        logger.error(`${context ? `[${context}] ` : ''}${hanaError.message}`)
        if (hanaError.details) {
          logger.error(`Details: ${JSON.stringify(hanaError.details, null, 2)}`)
        }
        if (hanaError.cause) {
          logger.error(`Caused by: ${hanaError.cause.message}`)
        }
        break
    }

    // For development, also log the full error object
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', hanaError.toJSON())
    }

    throw hanaError
  }

  /**
   * Handle error gracefully without throwing (for non-critical operations)
   */
  static handleGracefully(error: unknown, context?: string): HanaError {
    const hanaError = error instanceof HanaError ? error : ErrorFactory.wrap(error)

    logger.warn(`${context ? `[${context}] ` : ''}Non-critical error: ${hanaError.message}`)

    return hanaError
  }

  /**
   * Try-catch wrapper with automatic error handling
   */
  static async tryAsync<T>(
    operation: () => Promise<T>,
    context?: string,
    fallback?: T,
  ): Promise<T> {
    try {
      return await operation()
    }
    catch (error) {
      if (fallback !== undefined) {
        ErrorHandler.handleGracefully(error, context)
        return fallback
      }
      else {
        ErrorHandler.handle(error, context)
      }
    }
  }

  /**
   * Synchronous try-catch wrapper
   */
  static try<T>(
    operation: () => T,
    context?: string,
    fallback?: T,
  ): T {
    try {
      return operation()
    }
    catch (error) {
      if (fallback !== undefined) {
        ErrorHandler.handleGracefully(error, context)
        return fallback
      }
      else {
        ErrorHandler.handle(error, context)
      }
    }
  }
}

/**
 * Assertion utilities for validation
 */
export class Assert {
  /**
   * Assert that a value is truthy
   */
  static ok(value: any, message: string, details?: Record<string, any>): asserts value {
    if (!value) {
      throw ErrorFactory.validation(message, details)
    }
  }

  /**
   * Assert that a value is not null or undefined
   */
  static notNull<T>(value: T | null | undefined, message: string): asserts value is T {
    if (value == null) {
      throw ErrorFactory.validation(message, { value })
    }
  }

  /**
   * Assert that a string is not empty
   */
  static notEmpty(value: string | undefined | null, message: string): asserts value is string {
    if (!value || value.trim() === '') {
      throw ErrorFactory.validation(message, { value })
    }
  }

  /**
   * Assert that an array is not empty
   */
  static notEmptyArray<T>(value: T[] | undefined | null, message: string): asserts value is T[] {
    if (!value || value.length === 0) {
      throw ErrorFactory.validation(message, { length: value?.length })
    }
  }

  /**
   * Assert that a value is of expected type
   */
  static type(value: any, expectedType: string, message: string): void {
    const actualType = typeof value
    if (actualType !== expectedType) {
      throw ErrorFactory.validation(message, { expectedType, actualType, value })
    }
  }
}

/**
 * Utility functions for error handling
 */
export const ErrorUtils = {
  /**
   * Check if error is a specific HanaError code
   */
  isErrorCode(error: unknown, code: string): boolean {
    return error instanceof HanaError && error.code === code
  },

  /**
   * Check if error is a specific category
   */
  isErrorCategory(error: unknown, category: ErrorCategory): boolean {
    return error instanceof HanaError && error.category === category
  },

  /**
   * Extract user-friendly message from error
   */
  getUserMessage(error: unknown): string {
    if (error instanceof HanaError) {
      return error.message
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'An unexpected error occurred'
  },

  /**
   * Check if error should be retried
   */
  shouldRetry(error: unknown): boolean {
    if (error instanceof HanaError) {
      return error.category === ErrorCategory.NETWORK
        || error.category === ErrorCategory.DEPENDENCY
    }
    return false
  },
}
