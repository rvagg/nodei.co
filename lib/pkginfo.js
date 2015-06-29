const after        = require('after')
    , xtend        = require('xtend')
    , moment       = require('moment')
    , pkgdata      = require('./pkgdata')


function pkginfo (log, pkg, options, callback) {
  var info   = { name: pkg }
    , months = options.months >= 1 && options.months <= 12 ? options.months : 1
    , days   = moment().utcOffset(0).diff(moment().zone(0).subtract(months, 'months'), 'days')
    , done   = after(1, function (err) {
        if (err)
          return callback(err)
        callback(null, info)
      })

  pkgdata.pkgInfo(pkg, options, function (err, data) {
    if (err)
      log.error(err)
    else if (!data)
      return done(new Error('Package not found: ' + pkg))
    else
      info = xtend(info, data)
    done()
  })

  if (options.downloadSum) {

    done.count++
    pkgdata.pkgDownloadSum(pkg, days, function (err, downloadSum) {
      if (err)
        log.error(err)
      else
        info.downloadSum = downloadSum

      done()
    })

  }

  if (options.downloadDays) {

    done.count++
    pkgdata.pkgDownloadDays(pkg, days, function (err, downloadDays) {
      if (err)
        log.error(err)
      else
        info.downloadDays = downloadDays

      done()
    })

  }

  if (options.downloadRank) {

    done.count++
    pkgdata.pkgDownloadRank(pkg, function (err, ranking) {
      if (err)
        log.error(err)
      else if (ranking && ranking.rank && ranking.total)
        info.ranking = ranking

      done()
    })

  }
}


module.exports = pkginfo
