import pkgdata from './pkgdata.js'

async function pkginfo (pkg, options) {
  const data = await pkgdata.pkgInfo(pkg, options)

  if (!data) {
    throw new Error(`Package not found: ${pkg}`)
  }

  return { name: pkg, ...data }
}

export default pkginfo
