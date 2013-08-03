module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/npm/:pkg.json'
  , viewProcessor : 'jsonViewProcessor'
}

const validName  = require('../valid-name')
    , pkginfo    = require('../pkginfo')
    , draw       = require('../draw-npm-badge')

    , optionKeys = 'stars downloads compact mini'.split(' ')

function optionOn (request, option) {
  var o = request.query[option]
  if (o === '')
    return true
  if (!o)
    return false
  o = o.toLowerCase()
  return o != '0' && o != 'false' && o != 'no'
}

function handler (context, callback) {
  var options  = { }

  context.response.setHeader('cache-control', 'no-cache')

  if (!validName(context.params.pkg))
    return callback(null, { error: 'Invalid npm package name' })

  optionKeys.forEach(function (o) {
    options[o] = optionOn(context.request, o)
  })

  if (options.downloads)
    options.downloads = 1 // months

  pkginfo(context.params.pkg, options, function (err, pkginfo) {
    if (err)
      return callback(null, { error: 'Error fetching package info: ' + err.message })
 
    return callback(null, pkginfo)
  })
}