export const NODE_WEBSERVER_OPTIONS = [
  { label: 'No, this is a common library', value: 'none' },
  { label: 'Yes, use Fastify', value: 'fastify' },
  { label: 'Yes, use Express', value: 'express' },
] as const

export const NODE_TS_RUNTIME_OPTIONS = [
  { label: 'tsx', value: 'tsx' },
  { label: 'esno', value: 'esno' },
  { label: 'ts-node', value: 'ts-node' },
  { label: 'None', value: 'none' },
] as const

export const NODE_BUNDLERS_OPTIONS = [
  { label: 'tsup', value: 'tsup' },
  { label: 'tsdown', value: 'tsdown' },
  { label: 'None', value: 'none' },
] as const
