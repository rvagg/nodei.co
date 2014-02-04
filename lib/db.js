const dbLocation = __dirname + '/../nodeico.db'

const memoize    = require('memoize-async')
    , level      = require('level')
    , sublevel   = require('level-sublevel')
    , liveStream = require('level-live-stream')
    , ttl        = require('level-ttl')
    , LevelCache = require('level-ttl-cache')
    , os         = require('os')
    , flake      = require('flake')(
        Object.keys(os.networkInterfaces())
          .filter(function (iface) { return !(/^lo/).test(iface) })[0]
      )

function connect (callback) {
  level(dbLocation, function (err, db) {
    console.log('New LevelUP instance', dbLocation)
    if (err) return callback(err)

    db.on('error', function (err) {
      console.error('LEVELDB ERROR: [' + err + ']')
      console.error(err.stack)
      process.exit(1)
    })

    db = sublevel(db)
    db = ttl(db, { checkFrequency: 1000 })

    var dbs = {
        root : db
      , log  : db.sublevel('log')
    }

    liveStream(dbs.log, { old: false }).on('data', function (data) {
      var d = JSON.parse(data.value)
      console.log(d.time, d.url, d.remoteHost, d.headers.referer || '-', d.userAgent || '-')
    })

    return callback(null, dbs)
  })
}

var connect_m = memoize(connect, function () { return '-' })
  , DB = {
        log: function (data) {
          this._db.log.put(flake(), JSON.stringify(data))
        }

      , createCache: function (options, callback) {
          options.db = this._db.root
          callback(null, LevelCache(options))
        }
    }

function wrap (fn) {
  return function () {
    if (this._db) return fn.apply(this, arguments)

    var args     = Array.prototype.slice.call(arguments)
      , callback = args[args.length - 1]

    connect_m(function (err, db) {
      if (err) return callback(err)
      this._db = db
      fn.apply(this, args)
    }.bind(null))
  }
}

// wrap all the methods in a db-init method
Object.keys(DB).forEach(function (meth) {
  DB[meth] = wrap(DB[meth])
})

module.exports = Object.create(DB)
