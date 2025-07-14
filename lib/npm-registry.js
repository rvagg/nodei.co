import bole from 'bole'
import { LRUCache } from 'lru-cache'

const log = bole('npm-registry')

const registryUrl = 'https://registry.npmjs.org/'

// Native fetch wrapper with error handling
async function fetchJson (url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

// Cache configuration from environment
const cacheMaxSize = parseInt(process.env.CACHE_MAX_SIZE) || 1000
const cacheTTLMinutes = parseInt(process.env.CACHE_TTL_MINUTES) || 5

// LRU cache with TTL
const cache = new LRUCache({
  max: cacheMaxSize, // Maximum number of items
  ttl: 1000 * 60 * cacheTTLMinutes, // TTL in milliseconds
  updateAgeOnGet: false,
  updateAgeOnHas: false
})

const CACHE_TTL = {
  doc: 1000 * 60 * cacheTTLMinutes // Cache TTL for package docs
}

// Log configuration on first use
let configLogged = false
function logCacheConfig () {
  if (!configLogged) {
    log.info(`Cache configured: max=${cacheMaxSize} items, TTL=${cacheTTLMinutes} minutes`)
    configLogged = true
  }
}

async function getCached (key, ttl, loader) {
  const cached = cache.get(key)
  if (cached !== undefined) {
    return cached
  }

  const value = await loader()
  cache.set(key, value, { ttl })

  return value
}

async function loadDoc (pkg) {
  const url = registryUrl + pkg

  const doc = await fetchJson(url)

  if (doc.error) {
    throw new Error(`registry error: ${doc.error} (${(doc.reason || 'reason unknown')})`)
  }
  if (!doc.name) {
    throw new Error(`no name field found for ${pkg}`)
  }
  if (!doc['dist-tags']) {
    throw new Error(`no dist-tags found for ${pkg}`)
  }

  const version = doc['dist-tags'].latest
  if (!version) {
    throw new Error(`no dist-tags.latest found for ${pkg}`)
  }

  const cleanVersion = version.replace(/^v/, '')
  if (!doc.time || !doc.time[cleanVersion]) {
    throw new Error(`no version time for ${pkg}@${cleanVersion}`)
  }

  const latest = doc.versions && doc.versions[cleanVersion]

  return {
    name: doc.name,
    version: cleanVersion,
    updated: new Date(doc.time[cleanVersion]),
    dependencies: (latest && latest.dependencies && Object.keys(latest.dependencies).length) || 0,
    stars: doc.users && Object.keys(doc.users).length,
    preferGlobal: latest && latest.preferGlobal,
    depended: 0 // npm's dependedUpon view is gone, always return 0
  }
}

async function getPackageInfo (pkg, options = {}) {
  logCacheConfig() // Log on first use
  const cacheKey = `pkg:${pkg}`

  try {
    const data = await getCached(cacheKey, CACHE_TTL.doc, () => loadDoc(pkg))
    return data
  } catch (err) {
    log.error(err)
    throw err
  }
}

async function getUserPackages (username) {
  const url = `${registryUrl}-/user/${username}/package`

  const data = await fetchJson(url)
  // Return package names as an array
  return Object.keys(data || {})
}

async function getUserPackagesWithDetails (username) {
  const packageNames = await getUserPackages(username)

  // Fetch details for each package in parallel
  const packageDetails = await Promise.all(
    packageNames.map(async (pkgName) => {
      try {
        const info = await getPackageInfo(pkgName)
        // Get the full package doc to extract description
        const doc = await fetchJson(registryUrl + pkgName)
        return {
          name: info.name,
          description: doc.description || null,
          version: info.version,
          updated: info.updated
        }
      } catch (err) {
        log.error(`Failed to fetch details for ${pkgName}:`, err)
        // Return basic info if fetch fails
        return {
          name: pkgName,
          description: null,
          version: null,
          updated: null
        }
      }
    })
  )

  return packageDetails
}

// Compatibility layer for callback-based API
function getPackageInfoCallback (pkg, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  getPackageInfo(pkg, options)
    .then(data => callback(null, data))
    .catch(err => callback(err))
}

function getUserPackagesCallback (username, callback) {
  getUserPackages(username)
    .then(data => callback(null, data))
    .catch(err => callback(err))
}

export default {
  getPackageInfo: getPackageInfoCallback,
  getUserPackages: getUserPackagesCallback,
  getPackageInfoAsync: getPackageInfo,
  getUserPackagesAsync: getUserPackages,
  getUserPackagesWithDetailsAsync: getUserPackagesWithDetails,
  clearCache: () => cache.clear()
}
