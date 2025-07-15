import bole from 'bole'
import npmRegistry from './npm-registry.js'

const log = bole('pkgdata')

async function pkgInfo (pkg, options = {}) {
  try {
    const needsDownloads = options.downloads || (options.dataTypes && options.dataTypes.includes('downloads'))

    // Fetch package info and downloads in parallel if both are needed
    if (needsDownloads) {
      const [data, downloads] = await Promise.all([
        npmRegistry.getPackageInfo(pkg, options),
        npmRegistry.getDownloadCount(pkg)
      ])

      if (downloads !== null) {
        data.downloads = downloads
      }

      return data
    } else {
      // If downloads not needed, just fetch package info
      const data = await npmRegistry.getPackageInfo(pkg, options)
      return data
    }
  } catch (err) {
    log.error(err)
    throw err
  }
}

export default {
  pkgInfo
}
