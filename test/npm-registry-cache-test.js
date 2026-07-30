import { test } from 'node:test'
import assert from 'node:assert/strict'
import npmRegistry from '../lib/npm-registry.js'

test('caches failed package lookups to avoid repeat network calls', async (t) => {
  npmRegistry.clearCache()

  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    return new Response(JSON.stringify({ error: 'not_found', reason: 'document not found' }), {
      status: 404,
      statusText: 'Not Found'
    })
  })

  const pkg = 'this-package-definitely-does-not-exist-xyz123'

  await assert.rejects(() => npmRegistry.getPackageInfo(pkg), /HTTP 404/)
  await assert.rejects(() => npmRegistry.getPackageInfo(pkg), /HTTP 404/)
  await assert.rejects(() => npmRegistry.getPackageInfo(pkg), /HTTP 404/)

  assert.equal(calls, 1, 'only the first failed lookup hits the network, the rest are served from cache')
})

test('successful lookups are cached and are not mistaken for failures', async (t) => {
  npmRegistry.clearCache()

  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    return new Response(JSON.stringify({
      name: 'good-package',
      'dist-tags': { latest: '1.0.0' },
      time: { '1.0.0': '2024-01-01T00:00:00.000Z' },
      versions: { '1.0.0': { dependencies: {} } }
    }), { status: 200, statusText: 'OK' })
  })

  const pkg = 'good-package'
  const first = await npmRegistry.getPackageInfo(pkg)
  const second = await npmRegistry.getPackageInfo(pkg)

  assert.equal(first.name, 'good-package')
  assert.equal(second.name, 'good-package')
  assert.equal(calls, 1, 'second call is served from cache, not a fresh fetch')
})

test('a later successful lookup clears out a previously cached failure', async (t) => {
  npmRegistry.clearCache()

  let shouldFail = true
  t.mock.method(globalThis, 'fetch', async () => {
    if (shouldFail) {
      return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, statusText: 'Not Found' })
    }
    return new Response(JSON.stringify({
      name: 'flaky-package',
      'dist-tags': { latest: '1.0.0' },
      time: { '1.0.0': '2024-01-01T00:00:00.000Z' },
      versions: { '1.0.0': { dependencies: {} } }
    }), { status: 200, statusText: 'OK' })
  })

  const pkg = 'flaky-package'
  await assert.rejects(() => npmRegistry.getPackageInfo(pkg), /HTTP 404/)

  npmRegistry.clearCache()
  shouldFail = false

  const info = await npmRegistry.getPackageInfo(pkg)
  assert.equal(info.name, 'flaky-package')
})
