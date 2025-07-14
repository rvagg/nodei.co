import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// Badge generation tests
test('SVG badge for valid package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'image/svg+xml', 'correct content type')
  assert.equal(response.headers['cache-control'], 'no-cache', 'has no-cache header')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('npm install express'), 'contains install command')

  await app.close()
})

test('SVG badge with compact style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?compact=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('npm install express'), 'contains install command')

  await app.close()
})

test('SVG badge with mini style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?mini=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('npm install express'), 'contains install command')

  await app.close()
})

test('SVG badge with stars', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?stars=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('★'), 'contains star symbol')

  await app.close()
})

test('PNG route returns SVG with deprecation header', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.png'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'image/svg+xml', 'returns SVG content type')
  assert.equal(response.headers['x-deprecated'], 'PNG badges are deprecated. Please use .svg extension instead.')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')

  await app.close()
})

test('badge for non-existent package', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/this-package-definitely-does-not-exist-12345.svg'
  })

  assert.equal(response.statusCode, 404, 'returns 404')

  await app.close()
})

test('badge with invalid package name', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/INVALID PACKAGE NAME.svg'
  })

  assert.equal(response.statusCode, 400, 'returns 400')

  await app.close()
})
