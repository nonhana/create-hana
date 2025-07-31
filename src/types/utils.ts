export interface Option {
  label: string
  value: string
}

export type AllKeys<T> = T extends any ? keyof T : never

export type MaybePromise<T> = T | Promise<T>
