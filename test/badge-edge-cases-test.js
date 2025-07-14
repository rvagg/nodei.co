import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// Badge edge cases tests
test('badge for package with very long name', async () => {
  const app = createServer()
  // This is a real package with a very long name
  const longPackageName = 'eslint-plugin-jsx-a11y'

  const response = await app.inject({
    method: 'GET',
    url: `/npm/${longPackageName}.svg`
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes(`npm install ${longPackageName}`), 'contains full package name')
  // Check that the SVG has width attribute
  assert.ok(response.body.includes('width='), 'has width attribute')

  await app.close()
})

test('badge for scoped package with special characters', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/@babel/core.svg'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('npm install @babel/core'), 'contains scoped package name')

  await app.close()
})

test('badge with all options enabled', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/react.svg?stars=true&compact=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  // Compact mode should show version info
  assert.ok(response.body.includes('updated'), 'contains updated text in compact mode')

  await app.close()
})

test('badge for package with numbers in name', async () => {
  const app = createServer()
  const response = await app.inject({
    method: 'GET',
    url: '/npm/base64-js.svg'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('npm install base64-js'), 'contains package name with numbers')

  await app.close()
})

test('package name with dots and hyphens', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/socket.io.svg'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('npm install socket.io'), 'contains package name with dots')

  await app.close()
})
