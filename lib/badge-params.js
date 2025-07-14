const MARGIN = 4
const INSET = 2
// More conservative character width for cross-platform compatibility
const CHAR_WIDTH = 7.2 // Minimal increase from original 7 for font fallback safety
const PADDING_BUFFER = 3 // Very modest extra padding for font variation safety

function timeAgo (date) {
  const now = new Date()
  const updated = new Date(date)
  const diffMs = now - updated
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return 'recently'
}

function calculateParams (options, pkginfo) {
  const margin = options.mini ? 1 : MARGIN
  const installName = `${pkginfo.name}${pkginfo.preferGlobal ? ' -g' : ''}`
  const versionText = pkginfo.version ? `version ${pkginfo.version}` : ''
  const updatedText = pkginfo.updated ? `updated ${timeAgo(pkginfo.updated)}` : ''
  const compactText = options.compact &&
                      ((pkginfo.version !== undefined ? `v${pkginfo.version}` : '') +
                        ` ${updatedText}`)
  const versionPos = margin + 110 + 11 + CHAR_WIDTH * versionText.length + PADDING_BUFFER
  const updatedPos = margin + 110 + 11 + CHAR_WIDTH * updatedText.length + PADDING_BUFFER
  const compactPos = options.compact &&
                      margin + 95 + 11 + CHAR_WIDTH * compactText.length + PADDING_BUFFER
  const textPos = margin + (options.mini ? 50 : options.compact ? 95 : 110) +
                      11 + CHAR_WIDTH * (12 + installName.length) + PADDING_BUFFER // "npm install " + package name
  const miniEndPos = options.mini ? textPos + margin * 2 : 0
  const showStars = options.stars && pkginfo.stars !== undefined

  return {
    margin,
    inset: INSET,
    installName,
    versionText,
    updatedText,
    compactText,
    versionPos,
    updatedPos,
    compactPos,
    textPos,
    showStars,
    height: margin * 2 + (options.mini
      ? 22
      : options.compact
        ? 37
        : showStars
          ? 61
          : 48),
    width: options.mini
      ? miniEndPos
      : Math.max.apply(null, options.compact
        ? [compactPos, textPos]
        : [updatedPos, versionPos, textPos]
      ) + margin,
    style: options.mini
      ? 'mini'
      : options.compact ? 'compact' : 'standard'
  }
}

export default calculateParams
