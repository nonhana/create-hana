import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

export async function ensurePath(path: string) {
  const resolvedPath = resolve(path)
  const dir = dirname(resolvedPath)

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}
