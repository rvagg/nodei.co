const sendJson = require('send-data/json')
    , jsonist  = require('jsonist')
    , qs       = require('querystring')
    , pkgregex = require('../valid-name').pkgregex

    , pkginfoApiPfx = process.env.PKGINFO_API_PFX


module.exports      = handler
module.exports.path = `/api/npm/info/:pkg(${pkgregex})`


// nothing interesting in here yet
function handler (req, res, options, callback) {
  var url = pkginfoApiPfx + '/info/' + options.params.pkg + '?' + qs.stringify(options)

  res.setHeader('cache-control', 'no-cache')

  jsonist.get(url, function (err, data) {
    if (err)
      return callback(err)

    if (!data)
      return callback(new Error('No such package: ' + err.messages))

    sendJson(req, res, { statusCode: 200, body: data })
  })
}
