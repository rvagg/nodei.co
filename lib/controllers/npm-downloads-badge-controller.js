module.exports = handler
module.exports.$config = {
    category : 'controller'
  , route    : '/npm-dl/:pkg.png'
}

const validName  = require('../valid-name')
    , pkginfo    = require('../pkginfo')
    , draw       = require('../draw-npm-downloads-badge')

function handler (context, callback) {
  var options  = {
      nodepends: true
    , months: Math.round(context.request.query.months)
  }

  context.response.setHeader('cache-control', 'no-cache')

  if (!validName(context.params.pkg)) {
    context.model.message = 'Invalid npm package name'
    return callback(null, 'error')
  }

  options.downloads = options.months > 0 && options.months < 12
      ? Number(options.months)
      : 12

  pkginfo(context.params.pkg, options, function (err, pkginfo) {
    if (err) {
      context.model.message = 'Error fetching package info: ' + err.message
      return callback(null, 'error')
    }
 
    context.response.setHeader('content-type', 'image/png')

    draw(options, pkginfo).pngStream().pipe(context.response)
  })
}
