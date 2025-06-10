import { ErrorFactory } from './factory'

export class Assert {
  static ok(value: any, message: string, details?: Record<string, any>): asserts value {
    if (!value) {
      throw ErrorFactory.validation(message, details)
    }
  }

  static notNull<T>(value: T | null | undefined, message: string): asserts value is T {
    if (value == null) {
      throw ErrorFactory.validation(message, { value })
    }
  }

  static notEmpty(value: string | undefined | null, message: string): asserts value is string {
    if (!value || value.trim() === '') {
      throw ErrorFactory.validation(message, { value })
    }
  }

  static notEmptyArray<T>(value: T[] | undefined | null, message: string): asserts value is T[] {
    if (!value || value.length === 0) {
      throw ErrorFactory.validation(message, { length: value?.length })
    }
  }

  static type(value: any, expectedType: string, message: string): void {
    const actualType = typeof value
    if (actualType !== expectedType) {
      throw ErrorFactory.validation(message, { expectedType, actualType, value })
    }
  }
}
