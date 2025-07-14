import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// User packages route tests
test('user packages route for valid user with packages', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/~sindresorhus'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'text/html', 'correct content type')
  assert.equal(response.headers['cache-control'], 'no-cache', 'has no-cache header')
  assert.ok(response.body.includes('Packages by sindresorhus'), 'has user name in title')
  assert.ok(response.body.includes('<div class="packages-grid">'), 'has packages grid')

  await app.close()
})

test('user packages route for invalid username', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/~INVALID USERNAME!'
  })

  assert.equal(response.statusCode, 400, 'returns 400')
  const data = JSON.parse(response.body)
  assert.ok(data.error.includes('Invalid username'), 'error message')

  await app.close()
})

test('user packages route for user with no packages', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/~this-user-definitely-has-no-packages-12345'
  })

  assert.equal(response.statusCode, 404, 'returns 404')
  const data = JSON.parse(response.body)
  assert.ok(data.error.includes('No packages found for user'), 'error message')

  await app.close()
})

test('user packages route for username that is too long', async () => {
  const app = createServer()
  const longUsername = 'a'.repeat(101)

  const response = await app.inject({
    method: 'GET',
    url: `/~${longUsername}`
  })

  // Fastify returns 404 for URLs with very long parameters
  assert.equal(response.statusCode, 404, 'returns 404')
  const data = JSON.parse(response.body)
  assert.ok(data.error.toLowerCase().includes('not found'), 'route not found')

  await app.close()
})

test('user packages route for special characters in username', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/~user!name'
  })

  assert.equal(response.statusCode, 400, 'returns 400')
  const data = JSON.parse(response.body)
  assert.ok(data.error.includes('Invalid username'), 'error message')

  await app.close()
})
