# create-hana

A modern, flexible project scaffolding tool for Node.js applications.

## Features

- 🚀 **Fast & Modern**: Built with TypeScript and modern Node.js features
- 🎯 **Flexible**: Support for TypeScript/JavaScript, multiple package managers
- 🛠️ **Configurable**: Choose your preferred tools (ESLint, Prettier, Biome)
- 📦 **Bundler Support**: Integrated support for tsup, tsdown
- 🌐 **Web Server Ready**: Optional Express.js or Fastify setup
- 🧪 **Test Ready**: Comprehensive test suite with Vitest

## Usage

### With npm

```bash
npm create hana@latest my-project
```

### With pnpm

```bash
pnpm create hana my-project
```

### With yarn

```bash
yarn create hana my-project
```

### With bun

```bash
bun create hana my-project
```

## Project Types

Currently supports:

- **Node.js Library**: A general-purpose Node.js library/package

## Language Support

- **TypeScript** (recommended)
- **JavaScript**

## Package Managers

- **pnpm** (recommended)
- **npm**
- **yarn**
- **bun**

## Code Quality Tools

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Biome**: All-in-one tool for linting and formatting
- **ESLint + Prettier**: Combined setup

## Bundlers (TypeScript only)

- **tsup**: Fast TypeScript bundler
- **tsdown**: Lightweight TypeScript bundler
- **tsc**: TypeScript compiler only

## Web Server Support

- **Express.js**: Popular Node.js web framework
- **Fastify**: Fast and low overhead web framework
- **None**: Library only

## TypeScript Runtime

- **tsx**: Fast TypeScript execution (recommended)
- **ts-node**: TypeScript execution engine
- **esno**: Fast TypeScript/ESM execution
- **None**: Build only

## Architecture

The project follows a modular generator-based architecture:

- **CLI Layer**: User interaction and configuration collection
- **Core Orchestrator**: Coordinates all generators and file operations
- **Generators**: Modular components for different aspects (language, features, bundlers)
- **Utilities**: Shared helper functions for file operations, package.json manipulation, etc.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
