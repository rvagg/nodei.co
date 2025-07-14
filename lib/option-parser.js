import querystring from 'querystring'

const optionKeys = 'stars compact mini'.split(' ')

function optionOn (params, option) {
  let o = params[option]
  if (o === '') { return true }
  if (!o) { return false }
  o = String(o).toLowerCase()
  return o !== '0' && o !== 'false' && o !== 'no'
}

function optionParser (req) {
  const parsed = new URL(req.url, 'http://localhost')
  const qs = querystring.parse(parsed.search.slice(1))
  const options = {}

  for (let i = 0; i < optionKeys.length; i++) { options[optionKeys[i]] = optionOn(qs, optionKeys[i]) }

  return options
}

export default optionParser
