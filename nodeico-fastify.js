import path from 'path'
import fs from 'fs'
import Fastify from 'fastify'
import bole from 'bole'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

// Modern route implementations
import optionParser from './lib/option-parser.js'
import validName from './lib/valid-name.js'
import pkginfo from './lib/pkginfo.js'
import calculateParams from './lib/badge-params.js'
import npmRegistry from './lib/npm-registry.js'
import { renderBadge, renderIndex, renderUser } from './lib/templates.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const reqLog = bole('server:request')
const start = new Date()

// No template engine needed - using native template strings

export default function createServer () {
  const fastify = Fastify({
    logger: false // We use bole for logging
  })

  // Security headers
  fastify.addHook('onSend', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')
    reply.header('X-XSS-Protection', '1; mode=block')
    reply.header('Referrer-Policy', 'no-referrer')

    // CSP for HTML pages
    if (reply.getHeader('content-type')?.includes('text/html')) {
      reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'")
    }
  })

  // Request logging middleware
  fastify.addHook('onRequest', async (request, reply) => {
    request.reqLog = reqLog(randomUUID())

    // Log request details
    request.reqLog.info({
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    })

    reply.header('x-startup', start)
    reply.header('x-powered-by', 'whatevs')
  })

  // Response logging
  fastify.addHook('onResponse', async (request, reply) => {
    request.reqLog.info({
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime
    })
  })

  // Static file serving
  fastify.register(import('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/'
  })

  // Health check
  fastify.get('/_status', async (request, reply) => {
    return 'OK'
  })

  // Main index page
  fastify.get('/', async (request, reply) => {
    reply.type('text/html')
    return renderIndex()
  })

  // Script route
  fastify.get('/js/script.js', async (request, reply) => {
    const scriptPath = path.join(__dirname, 'public/badge-generator.js')
    const content = await fs.promises.readFile(scriptPath, 'utf8')

    reply.type('text/javascript')
    reply.header('cache-control', 'no-cache')
    return content
  })

  // NPM package info API - supports scoped packages
  fastify.get('/api/npm/info/:scope/:pkg', async (request, reply) => {
    const pkg = `${request.params.scope}/${request.params.pkg}`

    if (!validName(pkg)) {
      reply.code(400)
      return { error: `Invalid package name: ${pkg}` }
    }

    try {
      const data = await new Promise((resolve, reject) => {
        npmRegistry.getPackageInfo(pkg, {}, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })

      if (!data) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }

      reply.header('cache-control', 'no-cache')
      return data
    } catch (error) {
      request.reqLog.error({
        error: error.message,
        package: pkg,
        route: 'api-info-scoped'
      })
      if (error.message.includes('404')) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }
      reply.code(500)
      return { error: error.message }
    }
  })

  // NPM package info API - for regular packages
  fastify.get('/api/npm/info/:pkg', async (request, reply) => {
    const { pkg } = request.params

    if (!validName(pkg)) {
      reply.code(400)
      return { error: `Invalid package name: ${pkg}` }
    }

    try {
      const data = await new Promise((resolve, reject) => {
        npmRegistry.getPackageInfo(pkg, {}, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })

      if (!data) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }

      reply.header('cache-control', 'no-cache')
      return data
    } catch (error) {
      request.reqLog.error({
        error: error.message,
        package: pkg,
        route: 'api-info'
      })
      if (error.message.includes('404')) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }
      reply.code(500)
      return { error: error.message }
    }
  })

  // Legacy download histogram routes - return transparent 1x1 pixel
  const transparent1x1PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  )

  // Handle /npm-dl/* routes for backwards compatibility
  fastify.get('/npm-dl/:pkg.png', async (request, reply) => {
    const { pkg } = request.params
    request.reqLog.info({
      message: 'Legacy download histogram request',
      package: pkg,
      route: 'npm-dl'
    })

    reply.type('image/png')
    reply.header('cache-control', 'public, max-age=86400') // Cache for 1 day
    reply.header('x-deprecated', 'Download histograms are no longer available. This endpoint returns a transparent 1x1 pixel for backwards compatibility.')
    return transparent1x1PNG
  })

  // Handle scoped packages in download routes
  fastify.get('/npm-dl/:scope/:pkg.png', async (request, reply) => {
    const pkg = `${request.params.scope}/${request.params.pkg}`
    request.reqLog.info({
      message: 'Legacy download histogram request',
      package: pkg,
      route: 'npm-dl-scoped'
    })

    reply.type('image/png')
    reply.header('cache-control', 'public, max-age=86400') // Cache for 1 day
    reply.header('x-deprecated', 'Download histograms are no longer available. This endpoint returns a transparent 1x1 pixel for backwards compatibility.')
    return transparent1x1PNG
  })

  // Badge route (SVG and PNG) - supports scoped packages like @org/package
  fastify.get('/npm/:scope/:pkg.svg', async (request, reply) => {
    const pkg = `${request.params.scope}/${request.params.pkg}`
    return handleBadgeRequest({ ...request, params: { pkg } }, reply, 'svg')
  })

  fastify.get('/npm/:scope/:pkg.png', async (request, reply) => {
    const pkg = `${request.params.scope}/${request.params.pkg}`
    return handleBadgeRequest({ ...request, params: { pkg } }, reply, 'png')
  })

  // Badge route (SVG and PNG) - for regular packages
  fastify.get('/npm/:pkg.svg', async (request, reply) => {
    return handleBadgeRequest(request, reply, 'svg')
  })

  fastify.get('/npm/:pkg.png', async (request, reply) => {
    return handleBadgeRequest(request, reply, 'png')
  })

  // User packages route
  fastify.get('/~:user', async (request, reply) => {
    const { user } = request.params

    // Validate username - npm usernames are similar to package names
    if (!user || !/^[a-z0-9._-]+$/i.test(user) || user.length > 100) {
      reply.code(400)
      return { error: `Invalid username: ${user}` }
    }

    try {
      const packages = await npmRegistry.getUserPackagesWithDetailsAsync(user)

      if (!packages || !packages.length) {
        reply.code(404)
        return { error: `No packages found for user: ${user}` }
      }

      const html = renderUser(user, packages)

      reply.type('text/html')
      reply.header('cache-control', 'no-cache')
      return html
    } catch (error) {
      request.reqLog.error({
        error: error.message,
        user,
        route: 'user-packages'
      })
      if (error.message.includes('404')) {
        reply.code(404)
        return { error: `No packages found for user: ${user}` }
      }
      reply.code(500)
      return { error: error.message }
    }
  })

  // Package info page - supports scoped packages
  fastify.get('/npm/:scope/:pkg/', async (request, reply) => {
    const pkg = `${request.params.scope}/${request.params.pkg}`

    if (!validName(pkg)) {
      reply.code(400)
      return { error: `Invalid package name: ${pkg}` }
    }

    try {
      const data = await new Promise((resolve, reject) => {
        npmRegistry.getPackageInfo(pkg, {}, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })

      if (!data) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }

      // Simple redirect to main page with hash
      reply.redirect(`/#${encodeURIComponent(pkg)}`, 302)
    } catch (error) {
      request.reqLog.error({
        error: error.message,
        package: pkg,
        route: 'package-redirect-scoped'
      })
      if (error.message.includes('404')) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }
      reply.code(500)
      return { error: error.message }
    }
  })

  // Package info page - for regular packages
  fastify.get('/npm/:pkg/', async (request, reply) => {
    const { pkg } = request.params

    if (!validName(pkg)) {
      reply.code(400)
      return { error: `Invalid package name: ${pkg}` }
    }

    try {
      const data = await new Promise((resolve, reject) => {
        npmRegistry.getPackageInfo(pkg, {}, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })

      if (!data) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }

      // Simple redirect to main page with hash
      reply.redirect(`/#${pkg}`, 302)
    } catch (error) {
      request.reqLog.error({
        error: error.message,
        package: pkg,
        route: 'package-redirect'
      })
      if (error.message.includes('404')) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }
      reply.code(500)
      return { error: error.message }
    }
  })

  // Badge request handler
  async function handleBadgeRequest (request, reply, format) {
    const { pkg } = request.params
    const options = optionParser(request.raw)

    if (!validName(pkg)) {
      reply.code(400)
      return { error: `Invalid package name: ${pkg}` }
    }

    try {
      const packageInfo = await pkginfo(request.reqLog, pkg, options)

      const ctx = {
        options,
        pkginfo: packageInfo,
        params: calculateParams(options, packageInfo)
      }

      reply.header('cache-control', 'no-cache')
      reply.type('image/svg+xml')

      // Add deprecation header for PNG requests
      if (format === 'png') {
        reply.header('x-deprecated', 'PNG badges are deprecated. Please use .svg extension instead.')
      }

      return renderBadge(ctx)
    } catch (error) {
      request.reqLog.error({
        error: error.message,
        package: pkg,
        route: 'badge'
      })
      if (error.message.includes('404')) {
        reply.code(404)
        return { error: `Package not found: ${pkg}` }
      }
      reply.code(500)
      return { error: error.message }
    }
  }

  return fastify
}
