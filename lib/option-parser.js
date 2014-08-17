const url         = require('url')
    , querystring = require('querystring')

    , optionKeys  = 'stars downloads compact mini downloadRank'.split(' ')


function optionOn (params, option) {
  var o = params[option]
  if (o === '')
    return true
  if (!o)
    return false
  o = o.toLowerCase()
  return o != '0' && o != 'false' && o != 'no'
}


function optionParser (req) {
  var qs      = querystring.parse(url.parse(req.url).query)
    , options = { }
    , i       = 0

  for (i = 0; i < optionKeys.length; i++)
    options[optionKeys[i]] = optionOn(qs, optionKeys[i])

  return options
}


module.exports = optionParser
