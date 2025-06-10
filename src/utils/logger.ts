import pc from 'picocolors'

export const logger = {
  info(message: string) {
    console.log(pc.cyan('ℹ️'), message)
  },

  success(message: string) {
    console.log(pc.green('✅'), message)
  },

  warn(message: string) {
    console.log(pc.yellow('⚠️'), message)
  },

  error(message: string) {
    console.log(pc.red('❌'), message)
  },

  step(message: string) {
    console.log(pc.magenta('🔄'), message)
  },

  log(message: string) {
    console.log(message)
  },

  nextLine() {
    console.log('\n')
  },
}
