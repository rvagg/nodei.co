const hyperquest     = require('hyperquest')
    , bl             = require('bl')
    , qs             = require('querystring')
    , downloadCounts = require('npm-download-counts')
    , moment         = require('moment')
    , db             = require('./db')

    , registryUrl    = 'http://isaacs.iriscouch.com/registry/'
    , dependedUrl    = registryUrl + '_design/app/_view/dependedUpon?'

    , ttls = {
          doc       : 1000 * 60      // 1 minute
        , downloads : 1000 * 60 * 60 // 1 hour
        , depends   : 1000 * 60 * 60 // 1 hour
      }

var downloadsCache
  , dependsCache
  , docCache

db.createCache({
        name          : 'doc'
      , ttl           : ttls.doc
      , load          : loadDoc
      , valueEncoding : 'json'
    }
  , function (err, cache) { docCache = cache }
)
db.createCache({
        name          : 'download-totals'
      , ttl           : ttls.downloads
      , load          : loadDownloads
      , valueEncoding : 'json'
    }
  , function (err, cache) { downloadsCache = cache }
)
db.createCache({
        name          : 'depends'
      , ttl           : ttls.depends
      , load          : loadDepends
      , valueEncoding : 'json'
    }
  , function (err, cache) { dependsCache = cache }
)

function loadDownloads (key, callback) {
  var options = JSON.parse(key)
    , start = moment().subtract('months', options.months).toDate()
    , end   = new Date()

  downloadCounts(
      options.pkg
    , start
    , end
    , function (err, data) {
        if (err)
          return callback(err)
        callback(null, data)
      }
  )
}

function loadDepends (pkg, callback) {
  var query = {
          group_level : 3
        , startkey    : JSON.stringify([ pkg ])
        , endkey      : JSON.stringify([ pkg, {} ])
        , skip        : 0
        //, limit       : 1000
      }
    , url = dependedUrl + qs.stringify(query)

  hyperquest(url)
    .on('error', function (err) { console.log('depends', err.stack) })
    .pipe(bl(function (err, body) {
      if (err)
        return callback(err)
      try {
        var doc = JSON.parse(body.slice().toString())
        if (!doc.rows) return callback(new Error('bad dependedUpon document'))
        callback(null, doc.rows.length)
      } catch (e) {
        return callback(e)
      }
    }))
}

function loadDoc (pkg, callback) {
  hyperquest(registryUrl + pkg)
    .on('error', function (err) { console.log('doc', err.stack) })
    .pipe(bl(function (err, body) {
      if (err)
        return callback(err)
      try {
        var doc = JSON.parse(body.slice().toString())
          , version
          , latest

        if (doc.error)
          return callback(new Error(
              'registry error: '
              + doc.error
              + ' ('
              + (doc.reason || 'reason unknown')
              + ')'))

        if (!doc.name) return callback(new Error('no name found'))
        if (!doc['dist-tags']) return callback(new Error('no dit-tags found'))
        if (!(version = doc['dist-tags'].latest))
           return callback(new Error('no dist-tags.latest found'))
        if (!doc.time[version]) return callback(new Error('no version time'))

        latest = doc.versions && doc.versions[version]

        callback(null, {
            name         : doc.name
          , version      : version
          , updated      : new Date(doc.time[version])
          , dependencies : latest && latest.dependencies
              && Object.keys(latest.dependencies).length
          , stars        : doc.users && Object.keys(doc.users).length
          , preferGlobal : latest && latest.preferGlobal
        })
      } catch (e) {
        return callback(e)
      }
    }))
}

function pkginfo (pkg, options, callback) {
  var doc, depended, downloads

  function done (err) {
    if (!callback) return
    if (err) {
      callback(err)
      return callback = null
    }
    if (doc !== undefined
        && (options.nodepends || options.mini || depended !== undefined)
        && (!options.downloads || downloads !== undefined)) {

      doc.depended  = depended
      doc.downloads = downloads
      callback(null, doc)
      return callback = null
    }
  }

  docCache.get(pkg, function (err, _doc) {
    doc = _doc
    done(err)
  })

  if (!options.nodepends && !options.mini) {
    dependsCache.get(pkg, function (err, _depended) {
      depended = _depended
      done(err)
    })
  }

  if (options.downloads) {
    downloadsCache.get(
        JSON.stringify({ pkg: pkg, months: options.downloads })
      , function (err, _downloads) {
          downloads = _downloads
          done(err)
        }
    )
  }
}

module.exports = pkginfo