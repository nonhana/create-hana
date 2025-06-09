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
npm create hana@latest
```

### With pnpm

```bash
pnpm create hana
```

### With yarn

```bash
yarn create hana
```

### With bun

```bash
bun create hana
```

## Project Types

Currently supports:

- **Node.js Library**: A general-purpose Node.js library/package for daily use

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
