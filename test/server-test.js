import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

test('health check endpoint', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/_status'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.body, 'OK', 'returns OK')

  await app.close()
})

test('homepage returns HTML', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'text/html', 'correct content type')
  assert.ok(response.body.includes('<title>NodeICO - Classy Node.js Badges</title>'), 'has correct title')
  assert.ok(response.body.includes('Beautiful badges for your Node.js packages'), 'has tagline')

  await app.close()
})

test('static files served correctly', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/style.css'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.headers['content-type'].includes('text/css'), 'correct content type')
  assert.ok(response.body.includes('.hero'), 'contains CSS content')

  await app.close()
})

test('script endpoint returns JavaScript', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/js/script.js'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'text/javascript', 'correct content type')
  assert.equal(response.headers['cache-control'], 'no-cache', 'has no-cache header')
  assert.ok(response.body.includes('packageExists'), 'contains expected JS content')

  await app.close()
})

test('404 for non-existent routes', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/this-does-not-exist'
  })

  assert.equal(response.statusCode, 404, 'returns 404')

  await app.close()
})
