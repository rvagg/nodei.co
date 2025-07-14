import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// Security headers tests
test('security headers on HTML response', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/'
  })

  assert.equal(response.headers['x-content-type-options'], 'nosniff', 'has X-Content-Type-Options')
  assert.equal(response.headers['x-frame-options'], 'DENY', 'has X-Frame-Options')
  assert.equal(response.headers['x-xss-protection'], '1; mode=block', 'has X-XSS-Protection')
  assert.equal(response.headers['referrer-policy'], 'no-referrer', 'has Referrer-Policy')
  assert.ok(response.headers['content-security-policy'], 'has Content-Security-Policy')
  assert.ok(response.headers['content-security-policy'].includes("default-src 'self'"), 'CSP includes default-src')

  await app.close()
})

test('security headers on SVG response', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg'
  })

  assert.equal(response.headers['x-content-type-options'], 'nosniff', 'has X-Content-Type-Options')
  assert.equal(response.headers['x-frame-options'], 'DENY', 'has X-Frame-Options')
  assert.equal(response.headers['x-xss-protection'], '1; mode=block', 'has X-XSS-Protection')
  assert.equal(response.headers['referrer-policy'], 'no-referrer', 'has Referrer-Policy')
  assert.equal(response.headers['content-security-policy'], undefined, 'no CSP for non-HTML')

  await app.close()
})

test('security headers on JSON response', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/api/npm/info/express'
  })

  assert.equal(response.headers['x-content-type-options'], 'nosniff', 'has X-Content-Type-Options')
  assert.equal(response.headers['x-frame-options'], 'DENY', 'has X-Frame-Options')
  assert.equal(response.headers['x-xss-protection'], '1; mode=block', 'has X-XSS-Protection')
  assert.equal(response.headers['referrer-policy'], 'no-referrer', 'has Referrer-Policy')
  assert.equal(response.headers['content-security-policy'], undefined, 'no CSP for non-HTML')

  await app.close()
})
