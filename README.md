# nodei.co

Beautiful badges for your Node.js packages. Generate live npm stats for your GitHub README with customizable SVG badges.

**https://nodei.co**

## Examples

### Shields Style (GitHub README Compatible)
[![NPM](https://nodei.co/npm/express.svg?style=shields&data=n,v,d)](https://nodei.co/npm/express/)

```markdown
[![NPM](https://nodei.co/npm/express.svg?style=shields&data=n,v,d)](https://nodei.co/npm/express/)
```

### Standard Badge
[![NPM](https://nodei.co/npm/fastify.svg)](https://nodei.co/npm/fastify/)

```markdown
[![NPM](https://nodei.co/npm/fastify.svg)](https://nodei.co/npm/fastify/)
```

### Flat Design
[![NPM](https://nodei.co/npm/typescript.svg?style=flat&data=n,v)](https://nodei.co/npm/typescript/)

```markdown
[![NPM](https://nodei.co/npm/typescript.svg?style=flat&data=n,v)](https://nodei.co/npm/typescript/)
```

### Scoped Packages
[![NPM](https://nodei.co/npm/@babel/core.svg?style=shields&data=n,v,u)](https://nodei.co/npm/@babel/core/)

```markdown
[![NPM](https://nodei.co/npm/@babel/core.svg?style=shields&data=n,v,u)](https://nodei.co/npm/@babel/core/)
```

## Usage

Replace `package-name` with your npm package name:

```markdown
[![NPM](https://nodei.co/npm/package-name.svg)](https://nodei.co/npm/package-name/)
```

### Badge Styles

#### Modern Compact Badges
- `?style=shields` - GitHub README compatible, supports multi-data
- `?style=flat` - Modern design with rounded corners
- `?style=flat-square` - Flat design with square corners

#### Classic NodeICO Badges
- `?style=standard` - Full package information (default)
- `?style=compact` - Single-line condensed format
- `?style=mini` - Minimal install command only

### Data Options

Add package information with the `data` parameter. **Order matters** - data appears in the order specified:

- `name` or `n` - Package name
- `version` or `v` - Latest version
- `downloads` or `d` - Weekly downloads
- `stars` or `s` - GitHub stars
- `updated` or `u` - Last publish date

### Color Options

Customize badge colors with the `color` parameter:

- Named colors: `brightgreen`, `green`, `yellowgreen`, `yellow`, `orange`, `red`, `blue`, `lightgrey`
- Hex colors: Any valid hex color (e.g., `#007ec6`)
- Default: npm red (`#cb3837`)

Works with all badge styles, including classic badges where it changes the logo and border color.

#### Examples

```markdown
# Single data point
[![NPM](https://nodei.co/npm/express.svg?style=shields&data=version)](https://nodei.co/npm/express/)

# Multiple data points (order matters)
[![NPM](https://nodei.co/npm/react.svg?style=flat&data=n,v,d)](https://nodei.co/npm/react/)

# Reorder data as needed
[![NPM](https://nodei.co/npm/vue.svg?style=shields&data=d,v,u)](https://nodei.co/npm/vue/)

# Standard style with data
[![NPM](https://nodei.co/npm/lodash.svg?data=s,d)](https://nodei.co/npm/lodash/)

# Custom colors
[![NPM](https://nodei.co/npm/axios.svg?style=shields&data=n,v&color=blue)](https://nodei.co/npm/axios/)
[![NPM](https://nodei.co/npm/next.svg?style=flat&data=n,d&color=brightgreen)](https://nodei.co/npm/next/)
[![NPM](https://nodei.co/npm/vite.svg?color=orange)](https://nodei.co/npm/vite/)
```

### URL Format

```
https://nodei.co/npm/<package-name>.svg?<parameters>
```

**Scoped packages**: Include the full scope: `/npm/@babel/core.svg`
**Multiple data points**: Separate with commas: `data=n,v,d`

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

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## License

MIT License - see LICENSE file for details