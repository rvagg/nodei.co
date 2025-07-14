// Badge style registry
import standard from './standard.js'
import compact from './compact.js'
import mini from './mini.js'
import shields from './shields.js'
import flat from './flat.js'

// Style registry
const styles = new Map([
  ['standard', standard],
  ['compact', compact],
  ['mini', mini],
  ['shields', shields],
  ['flat', flat],
  ['flat-square', flat] // flat-square uses the same renderer as flat
])

// Get a badge style by name
export function getBadgeStyle (styleName = 'standard') {
  return styles.get(styleName) || styles.get('standard')
}

// Check if a style exists
export function hasStyle (styleName) {
  return styles.has(styleName)
}

// Get all available style names
export function getStyleNames () {
  return Array.from(styles.keys())
}

// Check if a style supports a data type
export function styleSupports (styleName, dataType) {
  const style = getBadgeStyle(styleName)
  return style.supports.includes(dataType)
}

// Export individual styles for direct access if needed
export { standard, compact, mini, shields, flat }
