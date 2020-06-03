'use strict'

const url         = require('url')
    , querystring = require('querystring')

    , optionKeys  = 'stars downloads compact mini downloadRank'.split(' ')


function optionOn (params, option) {
  let o = params[option]
  if (o === '')
    return true
  if (!o)
    return false
  o = String(o).toLowerCase()
  return o != '0' && o != 'false' && o != 'no'
}


function optionParser (req) {
  let qs      = querystring.parse(url.parse(req.url).query)
    , options = { }
    , i       = 0

  for (i = 0; i < optionKeys.length; i++)
    options[optionKeys[i]] = optionOn(qs, optionKeys[i])

  return options
}


module.exports = optionParser
