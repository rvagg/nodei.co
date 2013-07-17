var $       = require('./ender')
  , delayed = require('delayed')

  , $packageName

function makemeone () {
  console.log('make me a', $packageName.val())
}

$.domReady(function () {
  ($packageName = $('#makemeone').down('[name=packageName]'))
    .on('keydown', function (e) {
      if (e.keyCode == 13)
        e.preventDefault()
    })
    .on('keyup', delayed.cumulativeDelayed(function () {
      makemeone()
    }, 0.3))
})