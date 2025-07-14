import { createSvg, createRect, createText, createStyle, createNpmLogo, escapeXml } from '../badge-builder.js'

export function render (pkginfo, options, params) {
  const { margin, width, height, installName, compactText } = params

  // Style definitions
  const style = createStyle(`    .main-text {
      font-family: 'Courier New', Courier, 'DejaVu Sans Mono', 'Liberation Mono', Monaco, monospace;
      font-size: 11px;
      fill: rgb(102, 102, 102);
    }
    .install-text {
      font-family: 'Courier New', Courier, 'DejaVu Sans Mono', 'Liberation Mono', Monaco, monospace;
      font-size: 12px;
      font-weight: bold;
      fill: rgb(102, 102, 102);
    }`)

  // Background rectangle
  const bgRect = createRect(1, 1, width - 2, height - 2, 2, 2, 'rgb(244, 244, 242)', 'rgb(203, 56, 55)', 2)

  // NPM logo (smaller for compact)
  const logo = createNpmLogo(margin + 7, margin + 4, 0.15)

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
