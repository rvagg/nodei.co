import querystring from 'querystring'

const booleanOptions = 'stars compact mini downloads'.split(' ')

// Data type aliases
const dataAliases = {
  v: 'version',
  d: 'downloads',
  s: 'stars',
  u: 'updated',
  n: 'name',
  sz: 'size',
  l: 'license',
  dep: 'dependencies'
}

// Shields.io color mappings
const colorMappings = {
  brightgreen: '#4c1',
  green: '#97ca00',
  yellowgreen: '#a4a61d',
  yellow: '#dfb317',
  orange: '#fe7d37',
  red: '#e05d44',
  blue: '#007ec6',
  lightgrey: '#9f9f9f',
  lightgray: '#9f9f9f', // US spelling
  // Custom npm color
  npm: '#cb3837'
}

function optionOn (params, option) {
  let o = params[option]
  if (o === '') { return true }
  if (!o) { return false }
  o = String(o).toLowerCase()
  return o !== '0' && o !== 'false' && o !== 'no'
}

// Parse data parameter into array of data types
function parseDataTypes (dataParam) {
  if (!dataParam) return []

  const types = dataParam.split(',').map(t => t.trim())
  return types.map(type => dataAliases[type] || type)
}

function optionParser (req) {
  const parsed = new URL(req.url, 'http://localhost')
  const qs = querystring.parse(parsed.search.slice(1))
  const options = {}

  // Handle legacy boolean options
  for (const key of booleanOptions) {
    options[key] = optionOn(qs, key)
  }

  // Map legacy mini/compact to style parameter
  if (options.mini && !qs.style) {
    options.style = 'mini'
  } else if (options.compact && !qs.style) {
    options.style = 'compact'
  } else if (qs.style) {
    options.style = qs.style
  }

  // Parse data parameter
  if (qs.data) {
    options.dataTypes = parseDataTypes(qs.data)
  } else {
    // Legacy support: convert stars/downloads to dataTypes
    const legacyData = []
    if (options.stars) legacyData.push('stars')
    if (options.downloads) legacyData.push('downloads')
    if (legacyData.length > 0) {
      options.dataTypes = legacyData
    }
  }

  // Parse color parameter
  if (qs.color) {
    // Check if it's a named color
    if (colorMappings[qs.color]) {
      options.color = colorMappings[qs.color]
    } else if (/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(qs.color)) {
      // Accept hex colors
      options.color = qs.color
    }
    // If invalid color, ignore it (default will be used)
  }

  return options
}

export default optionParser
