module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : [ '/npm/:pkg.png', '/npm/:pkg.svg' ]
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

  if (!validName(context.params.pkg)) {
    context.model.message = 'Invalid npm package name'
    return callback(null, 'error')
  }

  optionKeys.forEach(function (o) {
    options[o] = optionOn(context.request, o)
  })

  if (options.downloads)
    options.downloads = 1 // months

  pkginfo(context.params.pkg, options, function (err, pkginfo) {
    if (err) {
      context.model.message = 'Error fetching package info: ' + err.message
      return callback(null, 'error')
    }
 
    if (/\.svg$/.test(context.request.url)) { // svg

      context.model.options = options
      context.model.pkginfo = pkginfo
      context.model.params  = draw.calculateParams(options, pkginfo)
      context.response.setHeader('content-type', 'image/svg+xml')
      callback(null, 'npm-badge')

    } else { // png

      context.response.setHeader('content-type', 'image/png')
      draw(options, pkginfo).pngStream().pipe(context.response)

    }
  })
}
