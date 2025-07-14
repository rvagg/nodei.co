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

  return options
}

export default optionParser
