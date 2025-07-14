# nodei.co - AI Development Guide

## What
SVG badge generator for npm packages. Example: `https://nodei.co/npm/express.svg`

## Stack
- **Server**: Fastify (ESM, Node 18+)
- **Templates**: Native JS template strings
- **Cache**: LRU in-memory (docs: 5min, downloads: 60min)
- **Tests**: Node.js built-in test runner
- **Style**: Standard.js

## Structure
```
nodeico.js          # Entry point
nodeico-fastify.js  # Server factory
lib/
  badge-styles/     # Modular badge renderers
    standard.js     # Classic NodeICO badge
    compact.js      # Compact badge style
    mini.js         # Mini badge style
    shields.js      # Shields.io compatible
    flat.js         # Flat & flat-square styles
    index.js        # Style registry
  badge-builder.js  # SVG utilities & escaping
  templates.js      # HTML pages, badge dispatcher
  npm-registry.js   # npm API + LRU cache
  badge-params.js   # Width calc for legacy styles
  pkginfo.js        # Package info wrapper
  valid-name.js     # Name validation
  option-parser.js  # Query param processing
public/
  badge-generator.js # Frontend lookup (no innerHTML)
  style.css         # Page styles
docs/
  DEPLOYMENT.md     # Deploy guide
```

## Key Routes
- `/npm/:pkg.svg` & `/npm/:scope/:pkg.svg` - Badges
- `/npm/:pkg.png` - Returns SVG (legacy compat)
- `/api/npm/info/:pkg` - Package JSON
- `/~:user` - User's packages with details
- `/_status` - Health check

## Badge System

### Styles
- `?style=standard` - Classic NodeICO badge (default)
- `?style=compact` - Condensed layout
- `?style=mini` - Minimal badge
- `?style=shields` - Shields.io compatible (20px height)
- `?style=flat` - Flat design with rounded corners
- `?style=flat-square` - Flat design with square corners

### Data Parameter
- `?data=n,v,d` - Show multiple data points (order matters)
- Aliases: `n` (name), `v` (version), `d` (downloads), `s` (stars), `u` (updated)
- Example: `?style=shields&data=n,v,u`

### Data Support by Style
- **shields/flat/flat-square**: All data types
- **standard**: Only stars and downloads via `data` param
- **compact/mini**: No data options

## Architecture
Badge styles are modular - each exports:
```js
{
  name: 'shields',
  supports: ['name', 'version', 'downloads', 'stars', 'updated'],
  render: (pkginfo, options, params) => svg,
  calculateDimensions: (pkginfo, options) => { width, height }
}
```

## Security
- **Input validation**: Package names, parameters
- **Output escaping**: `escapeXml()` for SVG, `escapeHtml()` for HTML
- **Security headers**: CSP, XSS protection, no-sniff
- **No innerHTML**: Client uses safe DOM methods
- **No color params**: Removed unused color options

## Environment Variables
- `HOST` - Bind address (default: localhost)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - 'production' or 'development'
- `LOG_FILE` - Optional file path for logs
- `CACHE_MAX_SIZE` - Max cached packages (default: 1000)
- `CACHE_DOCS_TTL_MINUTES` - Package docs cache (default: 5)
- `CACHE_DOWNLOADS_TTL_MINUTES` - Download stats cache (default: 60)

## Commands
```bash
npm test          # Run all tests
npm run lint      # Check style
npm start         # Start server
```

## Backward Compatibility (MAINTAIN)
Critical legacy support that must be preserved:

### Legacy Parameter Mapping
- `?mini=true` → `?style=mini`
- `?compact=true` → `?style=compact`
- `?stars=true` → `?data=stars`
- `?downloads=true` → `?data=downloads`
- Combined: `?stars=true&downloads=true` → `?data=stars,downloads`

### Legacy Routes
- `/npm/:pkg.png` → Returns SVG (not PNG) - many READMEs use this
- `/npm/:scope/:pkg.png` → Returns SVG for scoped packages
- `/npm-dl/:pkg.png` → Returns 1x1 transparent PNG (historical analytics)
- `/npm-dl/:scope/:pkg.png` → Returns 1x1 transparent PNG for scoped

### Priority Rules
- Modern `?style=` parameter overrides legacy `?mini=true/compact=true`
- Modern `?data=` parameter overrides legacy `?stars=true/downloads=true`
- Legacy params are converted in option-parser.js before badge rendering

## Critical Notes
1. **SVG only** - No Canvas/PNG generation
2. **Scoped packages** - Full @org/pkg support
3. **Width calc** - `chars * 7.2 + 3` for legacy styles
4. **Security** - Escape all output, validate inputs
5. **Modular styles** - Easy to add new badge formats
6. **Data ordering** - `data` param order affects display order
