const path       = require('path')
    , browserify = require('browserify')
    , once       = require('once')
    , send       = require('send-data')
    , bl         = require('bl')

    , index      = path.join(__dirname, '../../browser-lib/index.js')


module.exports      = handler
module.exports.path = '/js/script.js'


function handler (req, res, opts, callback) {
  callback = once(callback)

  browserify(index).bundle()
    .on('error', function (err) {
      callback(err)
    })
    .pipe(bl(function (err, data) {
      if (err)
        return callback(err)

      send(req, res, { body: data.toString(), headers: {
          'cache-control' : 'no-cache'
        , 'content-type'  : 'text/javascript'
      }})
    }))
}
