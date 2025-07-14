import { test } from 'node:test'
import assert from 'node:assert/strict'
import createServer from '../nodeico-fastify.js'

test('test index', async () => {
  const app = createServer()

  const response = await app.inject({
    method: 'GET',
    url: '/'
  })

  assert.equal(response.statusCode, 200, 'correct status code')
  assert.equal(response.headers['content-type'], 'text/html', 'correct content type')
  assert.match(response.body, /<title>NodeICO - Classy Node\.js Badges<\/title>/, 'got expected body')

  await app.close()
})
