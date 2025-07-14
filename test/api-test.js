import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// API endpoint tests
test('API info endpoint for valid package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/api/npm/info/express'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8', 'correct content type')
  assert.equal(response.headers['cache-control'], 'no-cache', 'has no-cache header')
  const data = JSON.parse(response.body)
  assert.equal(data.name, 'express', 'returns correct package name')
  assert.ok(data.version, 'has version')

  await app.close()
})

test('API info endpoint for invalid package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/api/npm/info/INVALID PACKAGE NAME'
  })

  assert.equal(response.statusCode, 400, 'returns 400')
  const data = JSON.parse(response.body)
  assert.ok(data.error.includes('Invalid package name'), 'error message')

  await app.close()
})

test('API info endpoint for non-existent package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/api/npm/info/this-package-definitely-does-not-exist-12345'
  })

  assert.equal(response.statusCode, 404, 'returns 404')
  const data = JSON.parse(response.body)
  assert.ok(data.error.includes('Package not found'), 'error message')

  await app.close()
})

test('API info endpoint for scoped package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/api/npm/info/@types/node'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  const data = JSON.parse(response.body)
  assert.equal(data.name, '@types/node', 'returns correct scoped package name')
  assert.ok(data.version, 'has version')

  await app.close()
})
