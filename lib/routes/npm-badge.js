const optionParser = require('../option-parser')
    , validName    = require('../valid-name')
    , draw         = require('../draw-npm-badge')
    , pkginfo      = require('../pkginfo')
    , sendView     = require('../send-view')


module.exports      = handler
module.exports.path = [ '/npm/:pkg.png', '/npm/:pkg.svg' ]


function handler (req, res, opts, callback) {
  var pkg     = opts.params.pkg
    , options = optionParser(req)

  if (!validName(pkg))
    return callback(new Error('Invalid npm package name (' + pkg + ')'))

  if (options.downloads) {
    options.downloads = 1 // months
    options.downloadSum = true
  }

  pkginfo(req.log, pkg, options, function (err, pkginfo) {
    if (err)
      return callback(new Error('Error fetching package info: ' + err.message))

    var ctx = {}

    res.setHeader('cache-control', 'max-age=60')

    if (/\.svg$/.test(req.url)) { // svg

      ctx.options = options
      ctx.pkginfo = pkginfo
      ctx.params  = draw.calculateParams(options, pkginfo)
      res.setHeader('content-type', 'image/svg+xml')
      sendView(req, res, 'npm-badge.svg', ctx, callback)

    } else { // png

      res.setHeader('content-type', 'image/png')
      draw(options, pkginfo).pngStream().pipe(res)

    }
  })
}
