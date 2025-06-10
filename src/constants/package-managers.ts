import type { PackageManager } from '@/types'

export const PACKAGE_MANAGERS: Record<string, PackageManager> = {
  npm: {
    name: 'npm',
    command: 'npm',
    installArgs: ['install'],
    lockFile: 'package-lock.json',
  },
  yarn: {
    name: 'Yarn',
    command: 'yarn',
    installArgs: ['install'],
    lockFile: 'yarn.lock',
  },
  pnpm: {
    name: 'pnpm',
    command: 'pnpm',
    installArgs: ['install'],
    lockFile: 'pnpm-lock.yaml',
  },
  bun: {
    name: 'Bun',
    command: 'bun',
    installArgs: ['install'],
    lockFile: 'bun.lockb',
  },
}
