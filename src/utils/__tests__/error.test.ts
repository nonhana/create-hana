import { describe, expect, it, vi } from 'vitest'
import {
  Assert,
  ErrorCategory,
  ErrorFactory,
  ErrorHandler,
  ErrorSeverity,
  ErrorUtils,
  HanaError,
} from '../error'

describe('hanaError', () => {
  it('should create error with correct properties', () => {
    const error = new HanaError({
      code: 'TEST_ERROR',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.HIGH,
      message: 'Test error message',
      details: { key: 'value' },
    })

    expect(error.name).toBe('HanaError')
    expect(error.code).toBe('TEST_ERROR')
    expect(error.category).toBe(ErrorCategory.VALIDATION)
    expect(error.severity).toBe(ErrorSeverity.HIGH)
    expect(error.message).toBe('Test error message')
    expect(error.details).toEqual({ key: 'value' })
  })

  it('should check category correctly', () => {
    const error = new HanaError({
      code: 'TEST_ERROR',
      category: ErrorCategory.FILE_SYSTEM,
      severity: ErrorSeverity.MEDIUM,
      message: 'Test error',
    })

    expect(error.isCategory(ErrorCategory.FILE_SYSTEM)).toBe(true)
    expect(error.isCategory(ErrorCategory.VALIDATION)).toBe(false)
  })

  it('should check severity correctly', () => {
    const error = new HanaError({
      code: 'TEST_ERROR',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      message: 'Test error',
    })

    expect(error.isAtLeastSeverity(ErrorSeverity.LOW)).toBe(true)
    expect(error.isAtLeastSeverity(ErrorSeverity.MEDIUM)).toBe(true)
    expect(error.isAtLeastSeverity(ErrorSeverity.HIGH)).toBe(true)
    expect(error.isAtLeastSeverity(ErrorSeverity.CRITICAL)).toBe(false)
  })

  it('should convert to JSON correctly', () => {
    const error = new HanaError({
      code: 'TEST_ERROR',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      message: 'Test error',
      details: { key: 'value' },
    })

    const json = error.toJSON()
    expect(json.name).toBe('HanaError')
    expect(json.code).toBe('TEST_ERROR')
    expect(json.category).toBe(ErrorCategory.VALIDATION)
    expect(json.severity).toBe(ErrorSeverity.MEDIUM)
    expect(json.message).toBe('Test error')
    expect(json.details).toEqual({ key: 'value' })
  })
})

describe('errorFactory', () => {
  it('should create validation error', () => {
    const error = ErrorFactory.validation('Invalid input', { field: 'name' })

    expect(error).toBeInstanceOf(HanaError)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.category).toBe(ErrorCategory.VALIDATION)
    expect(error.severity).toBe(ErrorSeverity.MEDIUM)
    expect(error.message).toBe('Invalid input')
    expect(error.details).toEqual({ field: 'name' })
  })

  it('should create file system error', () => {
    const cause = new Error('File not found')
    const error = ErrorFactory.fileSystem('Cannot read file', { path: '/test' }, cause)

    expect(error).toBeInstanceOf(HanaError)
    expect(error.code).toBe('FILE_SYSTEM_ERROR')
    expect(error.category).toBe(ErrorCategory.FILE_SYSTEM)
    expect(error.severity).toBe(ErrorSeverity.HIGH)
    expect(error.message).toBe('Cannot read file')
    expect(error.details).toEqual({ path: '/test' })
    expect(error.cause).toBe(cause)
  })

  it('should wrap unknown error', () => {
    const originalError = new Error('Original error')
    const wrapped = ErrorFactory.wrap(originalError, 'Operation failed')

    expect(wrapped).toBeInstanceOf(HanaError)
    expect(wrapped.code).toBe('WRAPPED_ERROR')
    expect(wrapped.category).toBe(ErrorCategory.SYSTEM)
    expect(wrapped.severity).toBe(ErrorSeverity.HIGH)
    expect(wrapped.message).toBe('Operation failed: Original error')
    expect(wrapped.cause).toBe(originalError)
  })

  it('should wrap non-error values', () => {
    const wrapped = ErrorFactory.wrap('string error', 'Operation failed')

    expect(wrapped).toBeInstanceOf(HanaError)
    expect(wrapped.code).toBe('UNKNOWN_ERROR')
    expect(wrapped.category).toBe(ErrorCategory.SYSTEM)
    expect(wrapped.severity).toBe(ErrorSeverity.HIGH)
    expect(wrapped.message).toBe('Operation failed: string error')
    expect(wrapped.details).toEqual({ originalError: 'string error' })
  })

  it('should return same error if already HanaError', () => {
    const originalError = ErrorFactory.validation('Test error')
    const wrapped = ErrorFactory.wrap(originalError)

    expect(wrapped).toBe(originalError)
  })
})

describe('errorHandler', () => {
  it('should handle error and throw', () => {
    const error = ErrorFactory.validation('Test error')

    expect(() => ErrorHandler.handle(error, 'test context')).toThrow(HanaError)
  })

  it('should handle gracefully and return error', () => {
    const error = ErrorFactory.validation('Test error')
    const result = ErrorHandler.handleGracefully(error, 'test context')

    expect(result).toBe(error)
  })

  it('should try async operation successfully', async () => {
    const operation = vi.fn().mockResolvedValue('success')

    const result = await ErrorHandler.tryAsync(operation, 'test context')

    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledOnce()
  })

  it('should try async operation with fallback', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Failed'))

    const result = await ErrorHandler.tryAsync(operation, 'test context', 'fallback')

    expect(result).toBe('fallback')
    expect(operation).toHaveBeenCalledOnce()
  })

  it('should try synchronous operation successfully', () => {
    const operation = vi.fn().mockReturnValue('success')

    const result = ErrorHandler.try(operation, 'test context')

    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledOnce()
  })

  it('should try synchronous operation with fallback', () => {
    const operation = vi.fn().mockImplementation(() => {
      throw new Error('Failed')
    })

    const result = ErrorHandler.try(operation, 'test context', 'fallback')

    expect(result).toBe('fallback')
    expect(operation).toHaveBeenCalledOnce()
  })
})

describe('assert', () => {
  it('should assert truthy values', () => {
    expect(() => Assert.ok(true, 'Should not throw')).not.toThrow()
    expect(() => Assert.ok('test', 'Should not throw')).not.toThrow()
    expect(() => Assert.ok(1, 'Should not throw')).not.toThrow()
  })

  it('should throw for falsy values', () => {
    expect(() => Assert.ok(false, 'Should throw')).toThrow(HanaError)
    expect(() => Assert.ok(null, 'Should throw')).toThrow(HanaError)
    expect(() => Assert.ok(undefined, 'Should throw')).toThrow(HanaError)
    expect(() => Assert.ok('', 'Should throw')).toThrow(HanaError)
    expect(() => Assert.ok(0, 'Should throw')).toThrow(HanaError)
  })

  it('should assert non-null values', () => {
    expect(() => Assert.notNull('test', 'Should not throw')).not.toThrow()
    expect(() => Assert.notNull(0, 'Should not throw')).not.toThrow()
  })

  it('should throw for null/undefined values', () => {
    expect(() => Assert.notNull(null, 'Should throw')).toThrow(HanaError)
    expect(() => Assert.notNull(undefined, 'Should throw')).toThrow(HanaError)
  })

  it('should assert non-empty strings', () => {
    expect(() => Assert.notEmpty('test', 'Should not throw')).not.toThrow()
    expect(() => Assert.notEmpty('  test  ', 'Should not throw')).not.toThrow()
  })

  it('should throw for empty strings', () => {
    expect(() => Assert.notEmpty('', 'Should throw')).toThrow(HanaError)
    expect(() => Assert.notEmpty('   ', 'Should throw')).toThrow(HanaError)
    expect(() => Assert.notEmpty(null, 'Should throw')).toThrow(HanaError)
    expect(() => Assert.notEmpty(undefined, 'Should throw')).toThrow(HanaError)
  })

  it('should assert non-empty arrays', () => {
    expect(() => Assert.notEmptyArray(['test'], 'Should not throw')).not.toThrow()
    expect(() => Assert.notEmptyArray([1, 2, 3], 'Should not throw')).not.toThrow()
  })

  it('should throw for empty arrays', () => {
    expect(() => Assert.notEmptyArray([], 'Should throw')).toThrow(HanaError)
    expect(() => Assert.notEmptyArray(null, 'Should throw')).toThrow(HanaError)
    expect(() => Assert.notEmptyArray(undefined, 'Should throw')).toThrow(HanaError)
  })

  it('should assert correct types', () => {
    expect(() => Assert.type('test', 'string', 'Should not throw')).not.toThrow()
    expect(() => Assert.type(123, 'number', 'Should not throw')).not.toThrow()
    expect(() => Assert.type(true, 'boolean', 'Should not throw')).not.toThrow()
  })

  it('should throw for incorrect types', () => {
    expect(() => Assert.type('test', 'number', 'Should throw')).toThrow(HanaError)
    expect(() => Assert.type(123, 'string', 'Should throw')).toThrow(HanaError)
    expect(() => Assert.type(true, 'string', 'Should throw')).toThrow(HanaError)
  })
})

describe('errorUtils', () => {
  it('should check error code correctly', () => {
    const error = ErrorFactory.validation('Test error')

    expect(ErrorUtils.isErrorCode(error, 'VALIDATION_ERROR')).toBe(true)
    expect(ErrorUtils.isErrorCode(error, 'FILE_SYSTEM_ERROR')).toBe(false)
    expect(ErrorUtils.isErrorCode(new Error('Regular error'), 'VALIDATION_ERROR')).toBe(false)
  })

  it('should check error category correctly', () => {
    const error = ErrorFactory.fileSystem('Test error')

    expect(ErrorUtils.isErrorCategory(error, ErrorCategory.FILE_SYSTEM)).toBe(true)
    expect(ErrorUtils.isErrorCategory(error, ErrorCategory.VALIDATION)).toBe(false)
    expect(ErrorUtils.isErrorCategory(new Error('Regular error'), ErrorCategory.FILE_SYSTEM)).toBe(false)
  })

  it('should extract user message correctly', () => {
    const hanaError = ErrorFactory.validation('Validation failed')
    const regularError = new Error('Regular error')
    const stringError = 'String error'

    expect(ErrorUtils.getUserMessage(hanaError)).toBe('Validation failed')
    expect(ErrorUtils.getUserMessage(regularError)).toBe('Regular error')
    expect(ErrorUtils.getUserMessage(stringError)).toBe('An unexpected error occurred')
  })

  it('should determine retry correctly', () => {
    const networkError = ErrorFactory.network('Network failed')
    const dependencyError = ErrorFactory.dependency('Dependency failed')
    const validationError = ErrorFactory.validation('Validation failed')
    const regularError = new Error('Regular error')

    expect(ErrorUtils.shouldRetry(networkError)).toBe(true)
    expect(ErrorUtils.shouldRetry(dependencyError)).toBe(true)
    expect(ErrorUtils.shouldRetry(validationError)).toBe(false)
    expect(ErrorUtils.shouldRetry(regularError)).toBe(false)
  })
})
