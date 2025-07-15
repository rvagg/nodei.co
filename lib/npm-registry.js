import bole from 'bole'
import { LRUCache } from 'lru-cache'

const log = bole('npm-registry')

const registryUrl = 'https://registry.npmjs.org/'
const downloadsUrl = 'https://api.npmjs.org/downloads/point/'

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
const cacheDocsTTLMinutes = parseInt(process.env.CACHE_DOCS_TTL_MINUTES) || parseInt(process.env.CACHE_TTL_MINUTES) || 5
const cacheDownloadsTTLMinutes = parseInt(process.env.CACHE_DOWNLOADS_TTL_MINUTES) || 60

// LRU cache with TTL
const cache = new LRUCache({
  max: cacheMaxSize, // Maximum number of items
  ttl: 1000 * 60 * Math.max(cacheDocsTTLMinutes, cacheDownloadsTTLMinutes), // Use longest TTL for cache
  updateAgeOnGet: false,
  updateAgeOnHas: false
})

const CACHE_TTL = {
  doc: 1000 * 60 * cacheDocsTTLMinutes, // Cache TTL for package docs
  downloads: 1000 * 60 * cacheDownloadsTTLMinutes // Cache TTL for download counts
}

// Log configuration on first use
let configLogged = false
function logCacheConfig () {
  if (!configLogged) {
    log.info(`Cache configured: max=${cacheMaxSize} items, docs TTL=${cacheDocsTTLMinutes} minutes, downloads TTL=${cacheDownloadsTTLMinutes} minutes`)
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

  try {
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
      depended: 0, // npm's dependedUpon view is gone, always return 0
      description: doc.description || null
    }
  } catch (err) {
    // Add package name to error for better debugging
    err.message = `Failed to fetch package "${pkg}": ${err.message}`
    throw err
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

async function getDownloadCount (pkg, period = 'last-week') {
  const cacheKey = `downloads:${pkg}:${period}`

  try {
    const data = await getCached(cacheKey, CACHE_TTL.downloads, async () => {
      const url = `${downloadsUrl}${period}/${encodeURIComponent(pkg)}`
      const result = await fetchJson(url)
      return result.downloads || 0
    })
    return data
  } catch (err) {
    // Don't log 404s for downloads, they're expected for new packages
    if (!err.message.includes('404')) {
      log.error(`Failed to fetch downloads for ${pkg}:`, err)
    }
    return null
  }
}

async function getUserPackagesWithDetails (username) {
  const packageNames = await getUserPackages(username)

  // Fetch details for each package in parallel
  const packageDetails = await Promise.all(
    packageNames.map(async (pkgName) => {
      try {
        // getPackageInfo now includes description, so we don't need a separate fetch
        const info = await getPackageInfo(pkgName)

        return {
          name: info.name,
          description: info.description,
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

export default {
  getPackageInfo,
  getUserPackages,
  getUserPackagesWithDetails,
  getDownloadCount,
  clearCache: () => cache.clear()
}
