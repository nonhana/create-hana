import type { Option } from '@/types'

export function toMutableOptions<T extends readonly { label: string, value: string }[]>(
  readonlyOptions: T,
): Option[] {
  return readonlyOptions.map(opt => ({
    label: opt.label,
    value: opt.value,
  }))
}
