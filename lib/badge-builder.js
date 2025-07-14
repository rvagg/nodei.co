// Common SVG building utilities for badges

export function createSvg (width, height, content) {
  return `<svg version="1.1"
    baseProfile="full"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    width="${width}px"
    height="${height}px"
    viewBox="0 0 ${width} ${height}"
  >
${content}
</svg>`
}

export function createRect (x, y, width, height, rx, ry, fill, stroke = null, strokeWidth = 0) {
  const strokeAttrs = stroke ? `stroke="${stroke}" stroke-width="${strokeWidth}"` : ''
  return `  <rect x="${x}" y="${y}"
      width="${width}" height="${height}"
      rx="${rx}" ry="${ry}"
      fill="${fill}"
      ${strokeAttrs}
  />`
}

export function createText (x, y, text, className, textAnchor = 'start') {
  return `  <text x="${x}" y="${y}" class="${className}" text-anchor="${textAnchor}">
    ${text}
  </text>`
}

export function createStyle (rules) {
  return `  <style>
${rules}
  </style>`
}

export function escapeXml (text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Calculate text width based on character count and font metrics
export function calculateTextWidth (text, charWidth = 7.2) {
  return text.length * charWidth
}

// Format large numbers for display
export function formatNumber (num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return String(num)
}

// Format time ago for display
export function formatTimeAgo (date) {
  const now = new Date()
  const updated = new Date(date)
  const diffMs = now - updated
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) return `${diffYears}y`
  if (diffMonths > 0) return `${diffMonths}mo`
  if (diffDays > 0) return `${diffDays}d`
  return 'today'
}

// NPM logo as SVG path
export const NPM_LOGO_PATH = 'M0,0H499.36c0.05,55.66,0.021,111.32,0.021,166.98c-83.221,0.039-166.44-0.051-249.66,0.049  c-0.07,9.32,0.14,18.65-0.11,27.971H138.8c-0.03-9.33,0-18.67-0.01-28C92.53,166.96,46.26,167,0,166.98V0z'
export const NPM_LOGO_PATHS = [
  'M27.73,28.02c37.021,0,74.05-0.01,111.07,0c-0.021,37.08,0.01,74.15-0.01,111.22  c-9.311,0-18.61,0.029-27.92-0.02c-0.021-27.801,0.01-55.591-0.011-83.391c-9.1-0.08-18.21,0.13-27.31-0.11  c-0.44,27.82-0.05,55.67-0.19,83.5c-18.55,0.049-37.09,0.02-55.63,0.02C27.72,102.17,27.73,65.09,27.73,28.02z',
  'M166.7,28.02c36.88-0.01,73.76-0.01,110.64,0c0,37.08,0.01,74.15-0.01,111.23  c-18.351-0.02-36.7,0.01-55.061-0.02c0.01,9.199-0.029,18.399,0.03,27.609c-18.53,0.34-37.07,0.051-55.6,0.141  C166.69,120.66,166.69,74.34,166.7,28.02z',
  'M305.27,28.03c55.47-0.03,110.95-0.03,166.42,0c-0.1,37.09,0.15,74.191-0.13,111.281  c-9.25-0.16-18.49,0-27.74-0.09c-0.01-27.791,0-55.591,0-83.391c-9.229-0.02-18.45,0-27.67,0c-0.02,27.81,0.01,55.609-0.01,83.42  c-9.24,0.02-18.47-0.07-27.71,0.04c-0.229-27.819-0.02-55.65-0.1-83.47c-9.24,0.02-18.471-0.01-27.71,0.02  c-0.091,27.82,0.149,55.65-0.12,83.471c-18.431-0.23-36.86,0.14-55.29-0.19C305.37,102.09,305.25,65.06,305.27,28.03z',
  'M222.37,111.439c-0.11-18.569-0.29-37.169,0.09-55.729c9.1,0.34,18.22-0.12,27.319,0.24  c-0.21,18.49,0.091,36.99-0.149,55.47C240.54,111.33,231.45,111.3,222.37,111.439z'
]

// Create npm logo SVG group
export function createNpmLogo (x, y, scale, fillColor = 'rgb(203, 56, 55)', bgColor = 'rgb(244, 244, 242)') {
  let paths = `    <g transform="translate(${x}, ${y})">\n`
  paths += `      <g transform="scale(${scale})">\n`
  paths += `        <path fill="${fillColor}" d="${NPM_LOGO_PATH}"/>\n`
  NPM_LOGO_PATHS.forEach(path => {
    paths += `<path fill="${bgColor}" d="${path}"/>\n`
  })
  paths += '      </g>\n'
  paths += '    </g>'
  return paths
}
