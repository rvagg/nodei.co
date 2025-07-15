import { createSvg, createRect, createText, createNpmLogo, escapeXml } from '../badge-builder.js'
import { createLegacyStyles, humanizeNumber } from './legacy-utils.js'

export function render (pkginfo, options, params) {
  const { color = 'rgb(203, 56, 55)' } = options
  const { margin, width, height, installName, versionText, updatedText, showStars, showDownloads, downloadsText } = params

  // Style definitions using shared utility
  const style = createLegacyStyles()

  // Background rectangle
  const bgRect = createRect(1, 1, width - 2, height - 2, 2, 2, 'rgb(244, 244, 242)', color, 2)

  // NPM logo
  const logo = createNpmLogo(margin + 7, margin + 7, 0.18, color)

  // Install command
  const installText = createText(margin + 110, margin + 15, `npm install ${escapeXml(installName)}`, 'install-text')

  // Version and updated text
  let content = `
  <!-- Standard layout -->
${createText(margin + 110, margin + 30, escapeXml(versionText), 'main-text')}
${createText(margin + 110, margin + 42, escapeXml(updatedText), 'main-text')}`

  // Stars and/or downloads on the same line
  const extraY = margin + 56

  if (showStars) {
    const starText = humanizeNumber(pkginfo.stars || 0)
    const starTextWidth = starText.length * 7.2 + 2
    const center = margin + 50

    content += `
  <!-- Stars -->
${createText(center - (starTextWidth + 10) / 2, extraY, starText, 'main-text')}
${createText(center + (starTextWidth + 10) / 2 - 7, extraY + 0.5, '★', 'star-icon')}`
  }

  if (showDownloads) {
    content += `
  <!-- Downloads -->
${createText(margin + 110, extraY, escapeXml(downloadsText), 'main-text')}`
  }

  // Combine all elements
  const svgContent = `
${style}

  <!-- Border and background -->
${bgRect}

  <!-- NPM logo -->
${logo}

  <!-- Install command -->
${installText}
${content}
`

  return createSvg(width, height, svgContent)
}

export default {
  name: 'standard',
  supports: ['stars', 'downloads'],
  render,
  calculateDimensions: null // Uses badge-params.js
}
