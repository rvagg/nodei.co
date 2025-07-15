import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// Security tests for injection attack prevention

// Script Injection Tests for Color Parameter
test('Script injection attempt in color parameter - script tag', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%3Cscript%3Ealert(1)%3C/script%3E'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('<script'), 'no script tag in output')
  assert.ok(!response.body.includes('alert('), 'no alert in output')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'uses default color')

  await app.close()
})

test('SVG injection attempt in color parameter - onload attribute', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%22%20onload=%22alert(1)'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('onload='), 'no onload attribute in output')
  assert.ok(!response.body.includes('alert('), 'no alert in output')

  await app.close()
})

test('SVG injection attempt in color parameter - foreignObject', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%22%3E%3CforeignObject%3E%3Cscript%3Ealert(1)%3C/script%3E%3C/foreignObject%3E%3Crect%20fill=%22'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('<foreignObject'), 'no foreignObject in output')
  assert.ok(!response.body.includes('<script'), 'no script tag in output')

  await app.close()
})

test('Attribute injection attempt in color parameter - closing quotes', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%22%3E%3C/rect%3E%3Cscript%3Ealert(1)%3C/script%3E'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('"><'), 'quotes are properly escaped')
  assert.ok(!response.body.includes('<script'), 'no script tag in output')

  await app.close()
})

test('Entity encoding injection attempt in color parameter', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%26%23x3C%3Bscript%26%23x3E%3Balert(1)%26%23x3C%3B/script%26%23x3E%3B'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('<script'), 'no script tag in output')
  assert.ok(!response.body.includes('&#x3C;'), 'entities are not double-encoded')

  await app.close()
})

test('JavaScript URL injection attempt in color parameter', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=javascript:alert(1)'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('javascript:'), 'no javascript URL in output')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'uses default color')

  await app.close()
})

test('Injection attempt with valid hex color format but malicious content', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%23ff0000%22%20onmouseover=%22alert(1)'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('onmouseover'), 'no event handler in output')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'uses default color (invalid format)')

  await app.close()
})

// Injection Tests for Package Names
test('Script injection attempt in package name - script tag', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/%3Cscript%3Ealert(1)%3C/script%3E.svg'
  })

  assert.equal(response.statusCode, 400, 'returns 400 for invalid package name')

  await app.close()
})

test('Injection attempt in package name - special characters', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express%22%3E%3Cscript%3Ealert(1)%3C/script%3E.svg'
  })

  assert.equal(response.statusCode, 400, 'returns 400 for invalid package name')

  await app.close()
})

// Injection Prevention in Error Messages
test('Injection prevention in error messages for invalid package', async () => {
  const app = createServer()

  const invalidPkg = '<script>alert(1)</script>'
  const response = await app.inject({
    method: 'GET',
    url: `/npm/${encodeURIComponent(invalidPkg)}.svg`
  })

  assert.equal(response.statusCode, 400, 'returns 400')
  let errorResponse
  assert.doesNotThrow(() => { errorResponse = JSON.parse(response.body) }, 'response body is valid JSON')
  // Check that the response is an {"error":""} object
  assert.ok(errorResponse.error, 'error field is present in response')
  assert.ok(errorResponse.error.includes('Invalid package name'), 'error message indicates invalid package name')

  await app.close()
})

// Color injection in different badge styles
test('Injection prevention in shields style with color', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=shields&color=%22%3E%3CforeignObject%3E%3Cscript%3Ealert(1)%3C/script%3E'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('<foreignObject'), 'no foreignObject in shields style')
  assert.ok(!response.body.includes('<script'), 'no script in shields style')

  await app.close()
})

test('Injection prevention in flat style with color', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=flat&color=%22%20style=%22display:none%22%20onload=%22alert(1)'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('onload='), 'no onload in flat style')
  assert.ok(!response.body.includes('style="display:none"'), 'no injected style attribute')

  await app.close()
})

test('Injection prevention in compact style with color', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=compact&color=%3C/style%3E%3Cscript%3Ealert(1)%3C/script%3E'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('<script'), 'no script in compact style')

  await app.close()
})

// Multiple parameters with injection attempts
test('Injection attempt in multiple parameters', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=shields&color=%3Cscript%3E&data=n%3Cscript%3E,v,d'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('<script'), 'no script tags in output')

  await app.close()
})

// Check that legitimate angle brackets in package descriptions are properly escaped
test('legitimate angle brackets are escaped in output', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  // If there are any angle brackets in the output, they should be escaped
  if (response.body.includes('<') || response.body.includes('>')) {
    // Make sure any angle brackets are part of SVG syntax, not injected content
    const svgWithoutTags = response.body.replace(/<[^>]+>/g, '')
    assert.ok(!svgWithoutTags.includes('<'), 'no unescaped < in text content')
    assert.ok(!svgWithoutTags.includes('>'), 'no unescaped > in text content')
  }

  await app.close()
})

// Verify XML entities are properly handled
test('XML entities in color parameter', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%26lt%3Bscript%26gt%3B'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('<script'), 'entities are not decoded to tags')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'uses default color')

  await app.close()
})

// Test color values that might break SVG structure
test('color value with newlines and special chars', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%23ff0000%0A%0D%3Cscript%3E'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(!response.body.includes('\n<script'), 'no script after newline')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'uses default color (invalid format)')

  await app.close()
})

test('extremely long color value', async () => {
  const app = createServer()

  const longColor = 'a'.repeat(1000)
  const response = await app.inject({
    method: 'GET',
    url: `/npm/express.svg?color=${longColor}`
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'uses default color for invalid input')
  assert.ok(!response.body.includes(longColor), 'long invalid color not included in output')

  await app.close()
})
