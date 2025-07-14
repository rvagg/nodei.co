import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// Package redirect route tests
test('package info redirect for regular package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express/'
  })

  assert.equal(response.statusCode, 302, 'returns 302 redirect')
  assert.equal(response.headers.location, '/#express', 'redirects to homepage with package hash')

  await app.close()
})

test('package info redirect for scoped package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/@types/node/'
  })

  assert.equal(response.statusCode, 302, 'returns 302 redirect')
  assert.equal(response.headers.location, '/#%40types%2Fnode', 'redirects with encoded scoped package')

  await app.close()
})

test('package info redirect for non-existent package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/this-package-definitely-does-not-exist-12345/'
  })

  assert.equal(response.statusCode, 404, 'returns 404')
  const data = JSON.parse(response.body)
  assert.ok(data.error.includes('Package not found'), 'error message')

  await app.close()
})

test('package info redirect for invalid package name', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/INVALID PACKAGE/'
  })

  assert.equal(response.statusCode, 400, 'returns 400')
  const data = JSON.parse(response.body)
  assert.ok(data.error.includes('Invalid package name'), 'error message')

  await app.close()
})
