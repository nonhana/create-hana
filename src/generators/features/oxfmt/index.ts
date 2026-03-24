export function generateOxfmtConfig(language: 'typescript' | 'javascript') {
  const isTS = language === 'typescript'

  const config = {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    ignorePatterns: [
      'dist/**',
      'coverage/**',
      'pnpm-lock.yaml',
      'package-lock.json',
      'node_modules/**',
    ],
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    arrowParens: 'always',
    bracketSpacing: true,
    semi: false,
    sortImports: {
      groups: isTS
        ? [
            'type-import',
            ['value-builtin', 'value-external'],
            'type-internal',
            'value-internal',
            ['type-parent', 'type-sibling', 'type-index'],
            ['value-parent', 'value-sibling', 'value-index'],
            'unknown',
          ]
        : [
            ['value-builtin', 'value-external'],
            'value-internal',
            ['value-parent', 'value-sibling', 'value-index'],
            'unknown',
          ],
    },
  }

  return JSON.stringify(config, null, 2)
}
