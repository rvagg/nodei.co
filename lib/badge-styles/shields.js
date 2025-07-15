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
  const { dataTypes = ['version'], color = '#cb3837' } = options

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

    // Text with shadow (shields.io specific)
    sectionsContent += `  <text x="${centerX}" y="${TEXT_Y + 1}" fill="#010101" fill-opacity="0.3" text-anchor="middle">${escapeXml(text)}</text>\n`
    sectionsContent += `  <text x="${centerX}" y="${TEXT_Y}" fill="#fff" text-anchor="middle">${escapeXml(text)}</text>\n`

    x += width
  })

  // Add gradient overlay for depth (shields.io style)
  const gradient = `  <defs>
    <linearGradient id="gradient" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity="0.1"/>
      <stop offset="1" stop-opacity="0.1"/>
    </linearGradient>
    <clipPath id="clip">
      <rect width="${totalWidth}" height="${HEIGHT}" rx="3"/>
    </clipPath>
  </defs>`

  const svgContent = `${gradient}
  <g clip-path="url(#clip)">
${sectionsContent}  </g>
  <rect width="${totalWidth}" height="${HEIGHT}" fill="url(#gradient)" rx="3"/>
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
  name: 'shields',
  supports: ['name', 'version', 'downloads', 'stars', 'updated'],
  render,
  calculateDimensions
}
