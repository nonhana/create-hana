import process from 'node:process'
import { HanaError } from '@/error/hana-error'
import { ErrorSeverity } from '@/types/error'
import { logger } from '@/utils/logger'
import { ErrorFactory } from './factory'

export class ErrorHandler {
  static handle(error: unknown, context?: string): never {
    const hanaError = error instanceof HanaError ? error : ErrorFactory.wrap(error)

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

    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', hanaError.toJSON())
    }

    throw hanaError
  }

  static handleGracefully(error: unknown, context?: string) {
    const hanaError = error instanceof HanaError ? error : ErrorFactory.wrap(error)

    logger.warn(`${context ? `[${context}] ` : ''}Non-critical error: ${hanaError.message}`)

    return hanaError
  }

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
