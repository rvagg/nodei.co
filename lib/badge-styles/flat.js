import { createSvg, escapeXml } from '../badge-builder.js'
import {
  MODERN_BADGE_CONSTANTS,
  buildSections,
  calculateSectionWidths,
  getSectionColors,
  calculateModernBadgeDimensions
} from './shared-utils.js'

const { HEIGHT, FONT_FAMILY, FONT_SIZE, TEXT_Y } = MODERN_BADGE_CONSTANTS

export function render (pkginfo, options, params) {
  const { dataTypes = ['version'], style, color = '#cb3837' } = options
  const isSquare = style === 'flat-square'
  const radius = isSquare ? 0 : 3

  // Build sections using shared utility
  const sections = buildSections(pkginfo, dataTypes)

  // Calculate dimensions using shared utilities
  const sectionWidths = calculateSectionWidths(sections)
  const totalWidth = sectionWidths.reduce((a, b) => a + b, 0)
  const colors = getSectionColors(sections.length, color)

  // Build SVG sections
  let x = 0
  let sectionsContent = ''

  sections.forEach((text, i) => {
    const width = sectionWidths[i]
    const centerX = x + width / 2

    // Background rectangle
    sectionsContent += `  <rect x="${x}" y="0" width="${width}" height="${HEIGHT}" fill="${escapeXml(colors[i])}"/>\n`

    // Text (no shadow for flat style)
    sectionsContent += `  <text x="${centerX}" y="${TEXT_Y}" fill="#fff" text-anchor="middle">${escapeXml(text)}</text>\n`

    x += width
  })

  // Clip path for rounded corners (if not square)
  const clipPath = !isSquare
    ? `  <defs>
    <clipPath id="clip">
      <rect width="${totalWidth}" height="${HEIGHT}" rx="${radius}"/>
    </clipPath>
  </defs>`
    : ''

  const groupWrapper = !isSquare
    ? `  <g clip-path="url(#clip)">
${sectionsContent}  </g>`
    : sectionsContent

  const svgContent = `${clipPath}
${groupWrapper}
  <style>
    text {
      font-family: ${FONT_FAMILY};
      font-size: ${FONT_SIZE}px;
      text-rendering: geometricPrecision;
    }
  </style>`

  return createSvg(totalWidth, HEIGHT, svgContent)
}

// Calculate dimensions for this style
export function calculateDimensions (pkginfo, options) {
  const { dataTypes = ['version'] } = options
  return calculateModernBadgeDimensions(pkginfo, dataTypes)
}

export default {
  name: 'flat',
  supports: ['name', 'version', 'downloads', 'stars', 'updated'],
  render,
  calculateDimensions
}
