# nodei.co - AI Development Guide

## What
SVG badge generator for npm packages. Example: `https://nodei.co/npm/express.svg`

## Stack
- **Server**: Fastify (ESM, Node 18+)
- **Templates**: Native JS template strings
- **Cache**: LRU in-memory (5min TTL)
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
- `/api/npm/info/:pkg` - Package JSON
- `/~:user` - User's packages with details
- `/_status` - Health check

## Critical Notes
1. **SVG only** - No Canvas/PNG generation
2. **Scoped packages** - Separate routes for @org/pkg
3. **Width calc** - `chars * 7.2 + 3` (cross-platform)
4. **Security** - Escape HTML, validate inputs, CSP headers
5. **No download stats** - API defunct, removed
6. **User route** - Fetches full package details

## Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - 'production' or 'development' (affects logging)
- `LOG_FILE` - Optional file path for logs
- `CACHE_MAX_SIZE` - Max cached packages (default: 1000)
- `CACHE_TTL_MINUTES` - Cache lifetime (default: 5)

## Commands
```bash
npm test          # Run all tests
npm run lint      # Check style
npm run lint:fix  # Fix style
npm start         # Start server (PORT=3000)
```

## Testing
- Uses Node.js test runner: `node --test`
- 34 tests covering all routes
- Run specific: `node --test test/badge-test.js`

## Don'ts
- Don't add Canvas/native deps
- Don't trust user input - always escape
- Don't create files unless necessary
- Don't commit without running tests + lint