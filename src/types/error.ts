export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  FILE_SYSTEM = 'file_system',
  NETWORK = 'network',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration',
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
}

export interface ErrorContext {
  code: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  details?: Record<string, any> | undefined
  cause?: Error | undefined
}
