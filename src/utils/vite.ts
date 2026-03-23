const defineConfigReg = /export\s+default\s+defineConfig\s*\(\s*\{([\s\S]*?)\}\s*\)/ // export default defineConfig({ ... })
const pluginsReg = /plugins\s*:\s*\[([^\]]*)\]/ // plugins: [ ... ]
const pluginItemReg = /^\s*\w+\s*\(.*\)\s*$/ // xxx(), vite plugin register item

export function addViteImport(code: string, importCode: string) {
  const trimmed = code || ''
  const lines = trimmed.split('\n')
  const firstNonEmptyIndex = lines.findIndex(line => line.trim().length > 0)

  // If existing imports, insert before the first one
  if (firstNonEmptyIndex >= 0 && lines[firstNonEmptyIndex]!.startsWith('import')) {
    return `${importCode}\n${trimmed}`
  }

  // Otherwise, prepend import
  return `${importCode}${trimmed ? '\n' : ''}${trimmed}`
}

export function addVitePlugin(code: string, pluginCode: string) {
  // Ensure pluginCode is a single expression like react() or react({...})
  if (!pluginItemReg.test(pluginCode)) {
    throw new Error('pluginCode must be a single expression, e.g., "react()"')
  }

  // Find defineConfig block
  const match = code.match(defineConfigReg)
  if (!match) {
    // keep original when not found
    return code
  }

  const inside = match[1]!
  // Try to find plugins property
  if (pluginsReg.test(inside)) {
    const replacedInside = inside.replace(pluginsReg, (_m, list) => {
      const trimmedList = list.trim() as string
      const newList = trimmedList.length > 0 ? `${trimmedList.trimEnd()}, ${pluginCode}` : pluginCode
      return `plugins: [${newList}]`
    })
    return code.replace(inside, replacedInside)
  }

  // Insert plugins property if not exists, place it near the top
  const withPlugins = inside.trim().length > 0
    ? `plugins: [${pluginCode}],\n${inside}`
    : `plugins: [${pluginCode}]`

  return code.replace(inside, withPlugins)
}
