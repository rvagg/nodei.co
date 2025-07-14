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

function formatDownloads (count) {
  if (count >= 1000000000) {
    return (count / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
  }
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return count.toString()
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
  const showDownloads = options.downloads && pkginfo.downloads !== undefined
  const downloadsText = showDownloads ? `${formatDownloads(pkginfo.downloads)} downloads/week` : ''
  const downloadsPos = showDownloads ? margin + 110 + 11 + CHAR_WIDTH * downloadsText.length + PADDING_BUFFER : 0

  // Calculate height based on what's being shown
  let height = margin * 2
  if (options.mini) {
    height += 22
  } else if (options.compact) {
    height += 37
  } else {
    height += 48 // Base height
    if (showStars || showDownloads) {
      height += 13 // One extra line for stars and/or downloads (they share the same line)
    }
  }

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
    showDownloads,
    downloadsText,
    downloadsPos,
    height,
    width: options.mini
      ? miniEndPos
      : Math.max.apply(null, options.compact
        ? [compactPos, textPos]
        : [updatedPos, versionPos, textPos, downloadsPos]
      ) + margin,
    style: options.mini
      ? 'mini'
      : options.compact ? 'compact' : 'standard'
  }
}

export default calculateParams
