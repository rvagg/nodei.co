import bole from 'bole'
import npmRegistry from './npm-registry.js'

const log = bole('pkgdata')

async function pkgInfo (pkg, options = {}) {
  try {
    const data = await npmRegistry.getPackageInfoAsync(pkg, options)

    // Fetch download stats if requested
    if (options.downloads) {
      const downloads = await npmRegistry.getDownloadCountAsync(pkg)
      if (downloads !== null) {
        data.downloads = downloads
      }
    }

    return data
  } catch (err) {
    log.error(err)
    throw err
  }
}

export default {
  pkgInfo
}
