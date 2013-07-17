var ender   = require('ender-js')
  , $       = ender.noConflict(function () {})

global.ender = $
require('bean/src/ender')
require('qwery-mobile/ender')
require('bonzo/src/ender')
require('domready/src/ender')
require('traversty/ender_bridge')

module.exports = $