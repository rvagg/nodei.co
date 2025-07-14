import test from 'node:test'
import assert from 'node:assert'
import createServer from '../nodeico-fastify.js'

test('shields style badge', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=shields'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('height="20"'), 'has shields height of 20px')
  assert.ok(response.body.includes('npm'), 'contains npm label')

  await app.close()
})

test('flat style badge', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=flat'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('height="20"'), 'has flat height of 20px')
  assert.ok(response.body.includes('npm'), 'contains npm label')

  await app.close()
})

test('flat-square style badge', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=flat-square'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('height="20"'), 'has flat-square height of 20px')
  assert.ok(response.body.includes('npm'), 'contains npm label')

  await app.close()
})

test('shields style with version data', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=shields&data=version'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('npm'), 'contains npm label')
  assert.ok(response.body.includes('v5.'), 'contains version with v prefix')

  await app.close()
})

test('shields style with multiple data points', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=shields&data=n,v,d'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('express'), 'contains package name')
  assert.ok(response.body.includes('v5.'), 'contains version')
  assert.ok(response.body.includes('dl/w'), 'contains download abbreviation')

  await app.close()
})

test('flat style with data parameter', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=flat&data=v,u'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('v5.'), 'contains version')
  assert.ok(response.body.includes('ago'), 'contains updated time')

  await app.close()
})

test('data parameter with aliases', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?style=shields&data=version,downloads'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('v5.'), 'contains version')
  assert.ok(response.body.includes('dl/w'), 'contains downloads')

  await app.close()
})

test('legacy parameter mapping - mini=true', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?mini=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('height="20'), 'has mini height')
  assert.ok(response.body.includes('npm install express'), 'contains install command')

  await app.close()
})

test('legacy parameter mapping - compact=true', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?compact=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('height="43'), 'has compact height')
  assert.ok(response.body.includes('npm install express'), 'contains install command')

  await app.close()
})

test('legacy parameter mapping - stars and downloads', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/express.svg?stars=true&downloads=true'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('★'), 'contains star symbol')
  assert.ok(response.body.includes('downloads/week'), 'contains downloads')

  await app.close()
})

test('scoped package with shields style', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/npm/@babel/core.svg?style=shields&data=n,v'
  })

  assert.equal(response.statusCode, 200, 'returns 200')
  assert.ok(response.body.includes('<svg'), 'contains SVG content')
  assert.ok(response.body.includes('@babel/core'), 'contains full scoped package name')
  assert.ok(response.body.includes('v7.'), 'contains version')

  await app.close()
})
