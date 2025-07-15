import { createSvg, createRect, createText, createStyle, createNpmLogo, escapeXml } from '../badge-builder.js'

export function render (pkginfo, options, params) {
  const { color = 'rgb(203, 56, 55)' } = options
  const { margin, width, height, installName } = params

  // Style definitions
  const style = createStyle(`    .install-text {
      font-family: 'Courier New', Courier, 'DejaVu Sans Mono', 'Liberation Mono', Monaco, monospace;
      font-size: 12px;
      font-weight: bold;
      fill: rgb(102, 102, 102);
    }`)

  // Background rectangle (account for stroke width to fit in viewBox)
  const strokeWidth = 1
  const bgRect = createRect(strokeWidth / 2, strokeWidth / 2, width - strokeWidth, height - strokeWidth, 3, 3, 'rgb(244, 244, 242)', color, strokeWidth)

  // NPM logo (tiny for mini)
  const logo = `
    <!-- Mini version npm logo -->
${createNpmLogo(margin + 3.5, margin + 3.5, 0.06, color)}`

  // Install command
  const installText = createText(margin + 49.5, margin + 12, `npm install ${escapeXml(installName)}`, 'install-text')

  // Combine all elements
  const svgContent = `
${style}

  <!-- Border and background -->
${bgRect}

  <!-- NPM logo -->
${logo}

  <!-- Install command -->
${installText}
`

  return createSvg(width, height, svgContent)
}

export default {
  name: 'mini',
  supports: [], // Mini style doesn't support additional data
  render,
  calculateDimensions: null // Uses badge-params.js
}
