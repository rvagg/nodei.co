import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

// Color parameter tests
test('badge with named color - npm red', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=npm'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.equal(response.headers['content-type'], 'image/svg+xml', 'correct content type')
  assert.ok(response.body.includes('#cb3837'), 'uses npm red color')

  await app.close()
})

test('badge with named color - brightgreen', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=brightgreen'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#4c1'), 'uses brightgreen color')

  await app.close()
})

test('badge with named color - all shields.io colors', async () => {
  const app = createServer()

  const colors = {
    brightgreen: '#4c1',
    green: '#97ca00',
    yellowgreen: '#a4a61d',
    yellow: '#dfb317',
    orange: '#fe7d37',
    red: '#e05d44',
    blue: '#007ec6',
    lightgrey: '#9f9f9f',
    lightgray: '#9f9f9f'
  }

  for (const [name, hex] of Object.entries(colors)) {
    const response = await app.inject({
      method: 'GET',
      url: `/npm/express.svg?color=${name}`
    })

    assert.equal(response.statusCode, 200, `returns 200 for ${name}`)
    assert.ok(response.body.includes(hex), `uses correct hex for ${name}`)
  }

  await app.close()
})

test('badge with hex color - 6 digits', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%23007ec6'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#007ec6'), 'uses hex color')

  await app.close()
})

test('badge with hex color - 3 digits', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%234c1'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#4c1'), 'uses short hex color')

  await app.close()
})

test('badge with invalid color - uses default', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=notacolor'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'falls back to default npm red')

  await app.close()
})

test('badge with invalid hex color - uses default', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%23xyz123'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'falls back to default npm red')

  await app.close()
})

test('color parameter works with shields style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=shields&color=blue'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#007ec6'), 'uses blue color')
  assert.ok(response.body.includes('height="20"'), 'is shields style')

  await app.close()
})

test('color parameter works with flat style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=flat&color=green'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#97ca00'), 'uses green color')

  await app.close()
})

test('color parameter works with flat-square style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=flat-square&color=orange'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#fe7d37'), 'uses orange color')
  assert.ok(!response.body.includes('rx="3"'), 'has square corners')

  await app.close()
})

test('color parameter works with compact style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=compact&color=red'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#e05d44'), 'uses red color for logo')

  await app.close()
})

test('color parameter works with mini style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=mini&color=yellow'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#dfb317'), 'uses yellow color for logo')

  await app.close()
})

test('color parameter works with standard style (default)', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=brightgreen'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('#4c1'), 'uses brightgreen color for logo')
  assert.ok(response.body.includes('npm install'), 'is standard style')

  await app.close()
})

test('color parameter with data sections in shields style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=shields&data=n,v,d&color=blue'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  // Check for darkened colors in subsequent sections
  assert.ok(response.body.includes('#00659e'), 'uses darkened blue for version section')
  assert.ok(response.body.includes('#004c77'), 'uses double darkened blue for downloads section')

  await app.close()
})

test('color parameter case insensitive', async () => {
  const app = createServer()

  const response1 = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=BRIGHTGREEN'
  })

  const response2 = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=BrightGreen'
  })

  // Named colors should be case sensitive (not recognized)
  assert.ok(response1.body.includes('rgb(203, 56, 55)'), 'uppercase invalid color uses default')
  assert.ok(response2.body.includes('rgb(203, 56, 55)'), 'mixed case invalid color uses default')

  await app.close()
})

test('hex color must include hash', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=007ec6'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'hex without hash uses default')

  await app.close()
})

test('empty color parameter uses default', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color='
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'empty color uses default')

  await app.close()
})

test('color parameter with special characters uses default', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?color=%3Cscript%3E'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('rgb(203, 56, 55)'), 'special chars use default')

  await app.close()
})
