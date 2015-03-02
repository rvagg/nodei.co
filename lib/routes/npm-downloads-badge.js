const url          = require('url')
    , querystring  = require('querystring')
    , validName    = require('../valid-name')
    , pkginfo      = require('../pkginfo')
    , draw         = require('../draw-npm-downloads-badge')


module.exports      = handler
module.exports.path = '/npm-dl/:pkg.png'


function handler (req, res, opts, callback) {
  var pkg     = opts.params.pkg
    , qs      = querystring.parse(url.parse(req.url).query)
    , options = {
          nodepends : true
        , months    : Math.round(qs.months || 12)
        , height    : qs.height > 1 ? parseInt(qs.height, 10) : 1
        , noLogo : (typeof qs.noLogo !== 'undefined') && (
            qs.noLogo === '' ||
            ['0', 'no', 'false'].indexOf(qs.noLogo) < 0
        )
      }

  res.setHeader('cache-control', 'no-cache')

  options.downloads = options.months > 0 && options.months < 12
      ? Number(options.months)
      : 12
  options.downloadDays = true

  if (!validName(pkg))
    return callback(new Error('Invalid npm package name (' + pkg + ')'))

  pkginfo(req.log, pkg, options, function (err, pkginfo) {
    if (err)
      return callback(new Error('Error fetching package info: ' + err.message))

    res.setHeader('content-type', 'image/png')

    draw(options, pkginfo).pngStream().pipe(res)
  })
}
