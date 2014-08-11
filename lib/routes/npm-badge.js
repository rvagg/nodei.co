const optionParser = require('../option-parser')
    , validName   = require('../valid-name')
    , pkginfo     = require('../pkginfo')
    , draw        = require('../draw-npm-badge')


module.exports      = handler
module.exports.path = [ '/npm/:pkg.png', '/npm/:pkg.svg' ]


function handler (req, res, opts, callback) {
  var pkg     = opts.params.pkg
    , options = optionParser(req)

  res.setHeader('cache-control', 'no-cache')

  if (!validName(pkg))
    return callback(new Error('Invalid npm package name (' + pkg + ')'))

  if (options.downloads)
    options.downloads = 1 // months

  pkginfo(pkg, options, function (err, pkginfo) {
    if (err)
      return callback(new Error('Error fetching package info: ' + err.message))

    var ctx = {}

    if (/\.svg$/.test(req.url)) { // svg

      ctx.options = options
      ctx.pkginfo = pkginfo
      ctx.params  = draw.calculateParams(options, pkginfo)
      res.setHeader('content-type', 'image/svg+xml')
      callback(null, 'npm-badge')

    } else { // png

      res.setHeader('content-type', 'image/png')
      draw(options, pkginfo).pngStream().pipe(res)

    }
  })
}
