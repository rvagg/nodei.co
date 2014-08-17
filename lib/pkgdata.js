const jsonist       = require('jsonist')
    , log           = require('bole')('pkgdata')
    , qs            = require('querystring')

    , pkginfoApiPfx = process.env.PKGINFO_API_PFX
    , npmdlApiPfx   = process.env.NPM_DL_API_PFX


if (!pkginfoApiPfx || !(/^https?:\/\//).test(pkginfoApiPfx))
  throw new Error('Must set $PKGINFO_API_PFX environment variable')

if (!npmdlApiPfx || !(/^https?:\/\//).test(npmdlApiPfx))
  throw new Error('Must set $NPM_DL_API_PFX environment variable')


function getJson (url, callback) {
  jsonist.get(url, function (err, data) {
    if (err) {
      log.error(err)
      return callback(err)
    }

    callback(null, data)
  })
}


function pkgInfo (pkg, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  var url = pkginfoApiPfx + '/info/' + pkg + '?' + qs.stringify(options)
  getJson(url, callback)
}


function _pkgDownloads (api, pkg, days, callback) {
  var url = npmdlApiPfx + '/download-' + api + '/' + pkg + '?days=' + days
  getJson(url, callback)
}


function pkgDownloadDays (pkg, days, callback) {
  _pkgDownloads('days', pkg, days, callback)
}


function pkgDownloadSum (pkg, days, callback) {
  _pkgDownloads('sum', pkg, days, callback)
}


function pkgDownloadRank (pkg, callback) {
  var url = npmdlApiPfx + '/rank/' + pkg
  getJson(url, callback)
}


module.exports.pkgInfo         = pkgInfo
module.exports.pkgDownloadSum  = pkgDownloadSum
module.exports.pkgDownloadDays = pkgDownloadDays
module.exports.pkgDownloadRank = pkgDownloadRank