import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// Legacy download histogram routes
test('legacy download histogram route returns transparent 1x1 PNG', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm-dl/express.png?months=6'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'image/png', 'correct content type')
  assert.equal(response.headers['cache-control'], 'public, max-age=86400', 'has cache header')
  assert.ok(response.headers['x-deprecated'], 'has deprecation header')

  // Check it's a valid PNG
  assert.ok(response.rawPayload.length > 0, 'has content')
  assert.ok(response.rawPayload.toString('hex').startsWith('89504e47'), 'is PNG format')

  await app.close()
})

test('legacy download histogram route for scoped package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm-dl/@babel/core.png?months=12'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'image/png', 'correct content type')
  assert.ok(response.headers['x-deprecated'].includes('transparent 1x1 pixel'), 'deprecation message mentions 1x1 pixel')

  await app.close()
})

test('legacy download routes ignore query parameters', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm-dl/lodash.png?months=3&height=100'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'image/png', 'correct content type')

  await app.close()
})
