import npmRegistry from './npm-registry.js'

async function pkgInfo (pkg, options = {}) {
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
  }

  // If downloads not needed, just fetch package info
  return npmRegistry.getPackageInfo(pkg, options)
}

export default {
  pkgInfo
}
