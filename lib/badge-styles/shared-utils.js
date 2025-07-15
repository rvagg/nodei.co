// Shared utilities for modern badge styles (shields, flat, flat-square)
import { formatNumber, formatTimeAgo, escapeXml } from '../badge-builder.js'

// Modern badge constants
export const MODERN_BADGE_CONSTANTS = {
  HEIGHT: 20,
  FONT_FAMILY: 'Verdana, Geneva, DejaVu Sans, sans-serif',
  FONT_SIZE: 11,
  TEXT_Y: 14, // Baseline position
  PADDING: 6,
  CHAR_WIDTH: 6.5 // Approximate character width for Verdana 11px
}

// Data formatters for modern badges
export function formatData (type, value, short = false) {
  switch (type) {
    case 'version':
    case 'v':
      return `v${value.replace(/^v/, '')}`
    case 'downloads':
    case 'd':
      return short ? `${formatNumber(value)} dl/w` : `${formatNumber(value)} downloads/week`
    case 'stars':
    case 's':
      return short ? `${formatNumber(value)}★` : `${formatNumber(value)} ${value === 1 ? 'star' : 'stars'}`
    case 'updated':
    case 'u': {
      const timeAgo = formatTimeAgo(value)
      if (timeAgo === 'today') {
        return short ? 'today' : 'updated today'
      }
      return short ? `${timeAgo} ago` : `updated ${timeAgo} ago`
    }
    default:
      return String(value)
  }
}

// Calculate section widths for modern badges
export function calculateSectionWidths (sections) {
  const { CHAR_WIDTH, PADDING } = MODERN_BADGE_CONSTANTS
  return sections.map(text => {
    const textWidth = text.length * CHAR_WIDTH
    return Math.round(textWidth + PADDING * 2)
  })
}

// Darken a hex color by a percentage
export function darkenColor (hex, percent) {
  // Remove # if present
  hex = hex.replace('#', '')

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Darken each component
  const factor = 1 - (percent / 100)
  const newR = Math.round(r * factor)
  const newG = Math.round(g * factor)
  const newB = Math.round(b * factor)

  // Convert back to hex
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return '#' + toHex(newR) + toHex(newG) + toHex(newB)
}

// Generate section colors for modern badges
export function getSectionColors (numSections, baseColor = '#cb3837') {
  const gray = '#555'

  if (numSections === 1) {
    return [gray]
  } else if (numSections === 2) {
    return [gray, baseColor]
  } else {
    // Generate progressively darker shades
    const colors = [gray, baseColor]
    for (let i = 2; i < numSections; i++) {
      const darkenPercent = (i - 1) * 20 // 20%, 40%, 60%, etc.
      colors.push(darkenColor(baseColor, darkenPercent))
    }
    return colors
  }
}

// Extract data values from package info based on data types
export function extractDataValues (pkginfo, dataTypes) {
  const values = []

  dataTypes.forEach(type => {
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
      values.push({ type, value })
    }
  })

  return values
}

// Build sections for modern badges
export function buildSections (pkginfo, dataTypes) {
  const sections = ['npm'] // Always use 'npm' as the label
  const dataValues = extractDataValues(pkginfo, dataTypes)
  const isMultiData = dataValues.length > 1

  dataValues.forEach(({ type, value }) => {
    if (type === 'name' || type === 'n') {
      sections.push(value) // Package name is shown as-is
    } else {
      sections.push(formatData(type, value, isMultiData))
    }
  })

  return sections
}

// Calculate dimensions for modern badges
export function calculateModernBadgeDimensions (pkginfo, dataTypes) {
  const sections = buildSections(pkginfo, dataTypes)
  const sectionWidths = calculateSectionWidths(sections)
  const totalWidth = sectionWidths.reduce((a, b) => a + b, 0)
  const { HEIGHT } = MODERN_BADGE_CONSTANTS

  return { width: totalWidth, height: HEIGHT }
}

// Create sections content for modern badges
export function createSectionsContent (sections, colors) {
  const { HEIGHT, TEXT_Y } = MODERN_BADGE_CONSTANTS
  const sectionWidths = calculateSectionWidths(sections)
  let x = 0
  let sectionsContent = ''

  sections.forEach((text, i) => {
    const width = sectionWidths[i]
    const centerX = x + width / 2

    // Background rectangle
    sectionsContent += `  <rect x="${x}" y="0" width="${width}" height="${HEIGHT}" fill="${escapeXml(colors[i])}"/>\n`

    // Text content will be added by the specific badge style
    sectionsContent += `  <text x="${centerX}" y="${TEXT_Y}" fill="#fff" text-anchor="middle">${escapeXml(text)}</text>\n`

    x += width
  })

  return { sectionsContent, sectionWidths, totalWidth: sectionWidths.reduce((a, b) => a + b, 0) }
}