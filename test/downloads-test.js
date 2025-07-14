import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// Test download statistics feature
test('badge with downloads parameter shows download count', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?downloads=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('downloads/week'), 'contains download text')
  // Badge should be taller when showing downloads
  assert.ok(response.body.includes('height="67"'), 'has increased height for downloads')

  await app.close()
})

test('badge with both stars and downloads', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/react.svg?stars=true&downloads=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('★'), 'contains star symbol')
  assert.ok(response.body.includes('downloads/week'), 'contains download text')
  // Badge should have same height as single feature since stars and downloads share a line
  assert.ok(response.body.includes('height="67"'), 'has correct height for both features on same line')

  await app.close()
})

test('downloads option ignored in compact mode', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?compact=true&downloads=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  // Compact mode should not show downloads
  assert.ok(!response.body.includes('downloads/week'), 'does not contain download text in compact mode')
  assert.ok(!response.body.includes('dl/w'), 'does not contain download abbreviation in compact mode')
  assert.ok(response.body.includes('height="43'), 'maintains compact height')

  await app.close()
})

test('downloads option ignored in mini mode', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?mini=true&downloads=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  // Mini mode should not show downloads
  assert.ok(!response.body.includes('downloads/week'), 'does not contain download text in mini mode')
  assert.ok(!response.body.includes('dl/w'), 'does not contain download abbreviation in mini mode')
  assert.ok(response.body.includes('height="20'), 'maintains mini height')

  await app.close()
})

test('badge handles missing download data gracefully', async () => {
  const app = createServer()

  // Use a very new/obscure package that might not have download data
  const response = await app.inject({
    method: 'GET',
    url: '/npm/this-is-a-very-new-package-12345.svg?downloads=true'
  })

  // Even if the package doesn't exist, the route should handle it
  assert.ok(response.statusCode === 200 || response.statusCode === 404, 'returns 200 or 404')

  await app.close()
})
