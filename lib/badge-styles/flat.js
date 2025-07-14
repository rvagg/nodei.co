import { createSvg, escapeXml, formatNumber, formatTimeAgo } from '../badge-builder.js'

// Flat style constants (same as shields but no gradient)
const HEIGHT = 20
const FONT_FAMILY = 'Verdana, Geneva, DejaVu Sans, sans-serif'
const FONT_SIZE = 11
const TEXT_Y = 14 // Baseline position
const PADDING = 6
const CHAR_WIDTH = 6.5 // Approximate character width for Verdana 11px

// Data formatters (same as shields)
function formatData (type, value, short = false) {
  switch (type) {
    case 'version':
    case 'v':
      return `v${value.replace(/^v/, '')}`
    case 'downloads':
    case 'd':
      return short ? `${formatNumber(value)} dl/w` : `${formatNumber(value)} downloads/week`
    case 'stars':
    case 's':
      return short ? `${formatNumber(value)}★` : `${formatNumber(value)} stars`
    case 'updated':
    case 'u': {
      const timeAgo = formatTimeAgo(value)
      return short ? `${timeAgo} ago` : `updated ${timeAgo} ago`
    }
    default:
      return String(value)
  }
}

// Calculate section widths
function calculateSectionWidths (sections) {
  return sections.map(text => {
    const textWidth = text.length * CHAR_WIDTH
    return Math.round(textWidth + PADDING * 2)
  })
}

// Generate section colors
function getSectionColors (numSections) {
  const npmRed = '#cb3837'
  const darkRed = '#a02622'
  const darkerRed = '#7d1d19'
  const evenDarkerRed = '#5a1511'
  const darkestRed = '#3d0e0b'
  const gray = '#555'

  if (numSections === 2) {
    return [gray, npmRed]
  } else if (numSections === 3) {
    return [gray, npmRed, darkRed]
  } else if (numSections === 4) {
    return [gray, npmRed, darkRed, darkerRed]
  } else if (numSections === 5) {
    return [gray, npmRed, darkRed, darkerRed, evenDarkerRed]
  } else if (numSections >= 6) {
    return [gray, npmRed, darkRed, darkerRed, evenDarkerRed, darkestRed]
  }
  return [gray]
}

export function render (pkginfo, options, params) {
  const { dataTypes = ['version'], style } = options
  const isSquare = style === 'flat-square'
  const radius = isSquare ? 0 : 3

  // Build sections
  const sections = ['npm'] // Always use 'npm' as the label

  // Add data sections
  const dataToShow = dataTypes
  const isMultiData = dataToShow.length > 1

  dataToShow.forEach(type => {
    let value
    switch (type) {
      case 'name':
      case 'n':
        value = pkginfo.name
        break
      case 'version':
      case 'v':
        value = pkginfo.version
        break
      case 'downloads':
      case 'd':
        value = pkginfo.downloads
        break
      case 'stars':
      case 's':
        value = pkginfo.stars || 0
        break
      case 'updated':
      case 'u':
        value = pkginfo.updated
        break
      default:
        value = null
    }

    if (value !== null && value !== undefined) {
      if (type === 'name' || type === 'n') {
        sections.push(value) // Package name is shown as-is
      } else {
        sections.push(formatData(type, value, isMultiData))
      }
    }
  })

  // Calculate dimensions
  const sectionWidths = calculateSectionWidths(sections)
  const totalWidth = sectionWidths.reduce((a, b) => a + b, 0)
  const colors = getSectionColors(sections.length)

  // Build SVG
  let x = 0
  let sectionsContent = ''

  // Clip path for rounded corners (if not square)
  const clipPath = !isSquare
    ? `  <defs>
    <clipPath id="clip">
      <rect width="${totalWidth}" height="${HEIGHT}" rx="${radius}"/>
    </clipPath>
  </defs>`
    : ''

  sections.forEach((text, i) => {
    const width = sectionWidths[i]
    const centerX = x + width / 2

    // Background rectangle
    sectionsContent += `  <rect x="${x}" y="0" width="${width}" height="${HEIGHT}" fill="${colors[i]}"/>\n`

    // Text (no shadow for flat style)
    sectionsContent += `  <text x="${centerX}" y="${TEXT_Y}" fill="#fff" text-anchor="middle">${escapeXml(text)}</text>\n`

    x += width
  })

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

// Calculate dimensions for this style (same as shields)
export function calculateDimensions (pkginfo, options) {
  const { dataTypes = ['version'] } = options
  const sections = ['npm']

  const dataToShow = dataTypes
  const isMultiData = dataToShow.length > 1

  dataToShow.forEach(type => {
    let value
    switch (type) {
      case 'name':
      case 'n':
        value = pkginfo.name
        break
      case 'version':
      case 'v':
        value = pkginfo.version
        break
      case 'downloads':
      case 'd':
        value = pkginfo.downloads
        break
      case 'stars':
      case 's':
        value = pkginfo.stars || 0
        break
      case 'updated':
      case 'u':
        value = pkginfo.updated
        break
      default:
        value = null
    }

    if (value !== null && value !== undefined) {
      if (type === 'name' || type === 'n') {
        sections.push(value) // Package name is shown as-is
      } else {
        sections.push(formatData(type, value, isMultiData))
      }
    }
  })

  const sectionWidths = calculateSectionWidths(sections)
  const totalWidth = sectionWidths.reduce((a, b) => a + b, 0)

  return { width: totalWidth, height: HEIGHT }
}

export default {
  name: 'flat',
  supports: ['name', 'version', 'downloads', 'stars', 'updated'],
  render,
  calculateDimensions
}
