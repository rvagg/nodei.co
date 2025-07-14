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
  templates.js      # SVG generation, HTML pages
  npm-registry.js   # npm API + LRU cache
  badge-params.js   # Width calc (CHAR_WIDTH=7.2)
  pkginfo.js        # Package info wrapper
  valid-name.js     # Name validation
public/
  badge-generator.js # Frontend lookup
  style.css         # Minimal styles
docs/
  nodeico.service   # systemd config
  nodeico.logrotate # Log rotation config
  DEPLOYMENT.md     # Deploy guide
```

## Key Routes
- `/npm/:pkg.svg` & `/npm/:scope/:pkg.svg` - Badges
- `/npm/:pkg.png` - Returns SVG (legacy compat)
- `/npm-dl/:pkg.png` - Returns 1x1 transparent PNG (legacy)
- `/api/npm/info/:pkg` - Package JSON
- `/~:user` - User's packages with details
- `/_status` - Health check

## Critical Notes
1. **SVG only** - No Canvas/PNG generation
2. **Scoped packages** - Separate routes for @org/pkg
3. **Width calc** - `chars * 7.2 + 3` (cross-platform)
4. **Security** - Escape HTML, validate inputs, CSP headers
5. **Download stats** - Available via ?downloads=true (uses npm API)
6. **User route** - Fetches full package details
7. **Legacy compat** - /npm-dl/* returns 1x1 PNG (histograms removed)

## Environment Variables
- `HOST` - Bind address (default: localhost, use 0.0.0.0 for all)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - 'production' or 'development' (affects logging)
- `LOG_FILE` - Optional file path for logs
- `CACHE_MAX_SIZE` - Max cached packages (default: 1000)
- `CACHE_DOCS_TTL_MINUTES` - Cache lifetime for package docs (default: 5)
- `CACHE_DOWNLOADS_TTL_MINUTES` - Cache lifetime for download stats (default: 60)

## Commands
```bash
npm test          # Run all tests
npm run lint      # Check style
npm run lint:fix  # Fix style
npm start         # Start server (PORT=3000)
```

## Testing
- Uses Node.js test runner: `node --test`
- 42 tests covering all routes and features
- Run specific: `node --test test/badge-test.js`

## Badge Options
- `?compact=true` - Compact layout
- `?mini=true` - Minimal badge
- `?stars=true` - Show GitHub stars
- `?downloads=true` - Show weekly downloads (standard only)

## Don'ts
- Don't add Canvas/native deps
- Don't trust user input - always escape
- Don't create files unless necessary
- Don't commit without running tests + lint