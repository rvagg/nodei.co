# nodei.co

NPM package badges for your README files.

**https://nodei.co**

## About

nodei.co provides simple, informative badges for npm packages that you can include in your project's README or documentation.

## Examples

### Standard Badge
[![NPM](https://nodei.co/npm/fastify.svg)](https://nodei.co/npm/fastify/)

```markdown
[![NPM](https://nodei.co/npm/fastify.svg)](https://nodei.co/npm/fastify/)
```

### Compact Badge
[![NPM](https://nodei.co/npm/@ipld/schema.svg?compact=true)](https://nodei.co/npm/@ipld/schema/)

```markdown
[![NPM](https://nodei.co/npm/@ipld/schema.svg?compact=true)](https://nodei.co/npm/@ipld/schema/)
```

### Mini Badge
[![NPM](https://nodei.co/npm/react.svg?mini=true)](https://nodei.co/npm/react/)

```markdown
[![NPM](https://nodei.co/npm/react.svg?mini=true)](https://nodei.co/npm/react/)
```

### With Stars
[![NPM](https://nodei.co/npm/vue.svg?stars=true)](https://nodei.co/npm/vue/)

```markdown
[![NPM](https://nodei.co/npm/vue.svg?stars=true)](https://nodei.co/npm/vue/)
```

### Scoped Package
[![NPM](https://nodei.co/npm/@types/node.svg?compact=true)](https://nodei.co/npm/@types/node/)

```markdown
[![NPM](https://nodei.co/npm/@types/node.svg?compact=true)](https://nodei.co/npm/@types/node/)
```

## Usage

Replace `package-name` with your npm package name:

```markdown
[![NPM](https://nodei.co/npm/package-name.svg)](https://nodei.co/npm/package-name/)
```

### Options

- `?compact=true` - Compact badge size
- `?mini=true` - Minimal badge size
- `?stars=true` - Include GitHub star count

### Scoped Packages

Scoped packages like `@babel/core` are fully supported:

```markdown
[![NPM](https://nodei.co/npm/@babel/core.svg)](https://nodei.co/npm/@babel/core/)
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm start

# Run with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions using systemd.

## License

MIT License - see LICENSE file for details