import * as pc from 'picocolors'

/**
 * Logger utility for consistent CLI output, with emojis :D
 */
export const logger = {
  /**
   * Log info message
   */
  info(message: string): void {
    console.log(pc.cyan('ℹ️'), message)
  },

  /**
   * Log success message
   */
  success(message: string): void {
    console.log(pc.green('✅'), message)
  },

  /**
   * Log warning message
   */
  warn(message: string): void {
    console.log(pc.yellow('⚠️'), message)
  },

  /**
   * Log error message
   */
  error(message: string): void {
    console.log(pc.red('❌'), message)
  },

  /**
   * Log step message
   */
  step(message: string): void {
    console.log(pc.magenta('➡️'), message)
  },

  /**
   * Log raw message without prefix
   */
  log(message: string): void {
    console.log(message)
  },

  /**
   * Print empty line
   */
  nextLine(): void {
    console.log('\n')
  },
}
