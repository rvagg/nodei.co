import { createSvg, createRect, createText, createNpmLogo, escapeXml } from '../badge-builder.js'
import { createLegacyStyles } from './legacy-utils.js'

export function render (pkginfo, options, params) {
  const { color = 'rgb(203, 56, 55)' } = options
  const { margin, width, height, installName, compactText } = params

  // Style definitions using shared utility
  const style = createLegacyStyles()

  // Background rectangle
  const bgRect = createRect(1, 1, width - 2, height - 2, 2, 2, 'rgb(244, 244, 242)', color, 2)

  // NPM logo (smaller for compact)
  const logo = createNpmLogo(margin + 7, margin + 4, 0.15, color)

  // Install command
  const installText = createText(margin + 95, margin + 12.5, `npm install ${escapeXml(installName)}`, 'install-text')

  // Compact info text
  const compactInfo = `
  <!-- Compact layout -->
${createText(margin + 95, margin + 27.5, escapeXml(compactText), 'main-text')}`

  // Combine all elements
  const svgContent = `
${style}

  <!-- Border and background -->
${bgRect}

  <!-- NPM logo -->
${logo}

  <!-- Install command -->
${installText}
${compactInfo}
`

  return createSvg(width, height, svgContent)
}

export default {
  name: 'compact',
  supports: [], // Compact style doesn't support additional data
  render,
  calculateDimensions: null // Uses badge-params.js
}
