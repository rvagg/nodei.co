import pkgdata from './pkgdata.js'

async function pkginfo (log, pkg, options) {
  let info = { name: pkg }

  try {
    const data = await pkgdata.pkgInfo(pkg, options)

    if (!data) {
      throw new Error(`Package not found: ${pkg}`)
    }

    info = { ...info, ...data }
    return info
  } catch (err) {
    log.error(err)
    throw err
  }
}

export default pkginfo
