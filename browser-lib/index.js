var $         = require('./ender')
  , delayed   = require('delayed')
  , validName = require('../lib/valid-name')

  , $makemeone
  , $packageName
  , $monthsRadios
  , selectedMonths = 12

  , tmpl = {
        plain: {
            img  : '<img src="/npm/{pkg}.png">'
          , code : '<textarea class="copyable" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm/{pkg}.png"></a></textarea>'
                 + '<textarea class="copyable" readonly>[![NPM](https://nodei.co/npm/{pkg}.png)](https://nodei.co/npm/{pkg}/)</textarea>'
        }
      , downloads: {
            img  : '<img src="/npm/{pkg}.png?downloads=true">'
          , code : '<textarea class="copyable" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm/{pkg}.png?downloads=true"></a></textarea>'
                 + '<textarea class="copyable" readonly>[![NPM](https://nodei.co/npm/{pkg}.png?downloads=true)](https://nodei.co/npm/{pkg}/)</textarea>'
        }
      , 'downloads-stars': {
            img  : '<img src="/npm/{pkg}.png?downloads=true&stars=true">'
          , code : '<textarea class="copyable" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm/{pkg}.png?downloads=true&stars=true"></a></textarea>'
                 + '<textarea class="copyable" readonly>[![NPM](https://nodei.co/npm/{pkg}.png?downloads=true&stars=true)](https://nodei.co/npm/{pkg}/)</textarea>'
        }
      , compact: {
            img  : '<img src="/npm/{pkg}.png?compact=true">'
          , code : '<textarea class="copyable" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm/{pkg}.png?compact=true"></a></textarea>'
                 + '<textarea class="copyable" readonly>[![NPM](https://nodei.co/npm/{pkg}.png?compact=true)](https://nodei.co/npm/{pkg}/)</textarea>'
        }
      , mini: {
            img  : '<img src="/npm/{pkg}.png?mini=true">'
          , code : '<textarea class="copyable" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm/{pkg}.png?mini=true"></a></textarea>'
                 + '<textarea class="copyable" readonly>[![NPM](https://nodei.co/npm/{pkg}.png?mini=true)](https://nodei.co/npm/{pkg}/)</textarea>'
        }
      , dl: {
            img   : '<img src="/npm-dl/{pkg}.png">'
          , imgM  : '<img src="/npm-dl/{pkg}.png?months={months}">'
          , code  : '<textarea class="copyable" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm-dl/{pkg}.png"></a></textarea>'
                  + '<textarea class="copyable" readonly>[![NPM](https://nodei.co/npm-dl/{pkg}.png)](https://nodei.co/npm/{pkg}/)</textarea>'
          , codeM : '<textarea class="copyable" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm-dl/{pkg}.png?months={months}"></a></textarea>'
                  + '<textarea class="copyable" readonly>[![NPM](https://nodei.co/npm-dl/{pkg}.png?months={months})](https://nodei.co/npm/{pkg}/)</textarea>'
        }
    }

function tmplpkg (tmpl, pkg, months) {
  return tmpl.replace(/\{pkg\}/g, pkg).replace(/\{months\}/g, months)
}

function packageExists (pkg, callback) {
  $.ajax({
      url: '/npm/' + pkg + '.json'
    , type: 'json'
    , method: 'get'
    , error: function () {
        callback && callback(false)
        callback = null
      }
    , success: function (resp) {
        callback && callback(resp.name == pkg)
        callback = null
      }
  })
}

function dontmakemeone (pkg, valid) {
  if (window.history && window.history.pushState)
    window.history.pushState('', '', window.location.pathname)

  $makemeone.down('.badges').hide()

  if (!pkg)
    return $makemeone.down('.package-not-found').hide()

  $makemeone.down('.package-not-' + (valid ? 'valid' : 'found'))
    .hide()
  $makemeone.down('.package-not-' + (valid ? 'found' : 'valid'))
    .show()
    .down('span').text(pkg)
}

function makemeone () {
  var pkg   = $packageName.val().trim()
    , valid = pkg && validName(pkg)

  if (!pkg || !valid)
    return dontmakemeone(pkg, valid)

  packageExists(pkg, function (exists) {
    if (!exists)
      return dontmakemeone(pkg, true)

    if (window.history && window.history.pushState)
      window.history.pushState('', '', window.location.pathname + '#' + pkg)

    $makemeone.down('.badges').show()
    $makemeone.down('.package-not-found, .package-not-valid').hide()

    placeBadges(pkg)
    updateMonths()
  })
}

function placeBadge(type, pkg) {
  var t = tmpl[type]
  $makemeone.down('.badge.' + type + ' .img').html(
    tmplpkg(t[type == 'dl' && selectedMonths != 12 ? 'imgM' : 'img'], pkg, selectedMonths)
  )
  $makemeone.down('.badge.' + type + ' .code').html(
    tmplpkg(t[type == 'dl' && selectedMonths != 12 ? 'codeM' : 'code'], pkg, selectedMonths)
  )
}

function placeBadges (pkg, justMonths) {
  if (justMonths)
    return placeBadge('dl', pkg)
  Object.keys(tmpl).forEach(function (k) { placeBadge(k, pkg) })
}

function updateMonths () {
  selectedMonths = $monthsRadios.filter(function () { return this.checked }).val() || 12
  placeBadges($packageName.val(), true)
}

$.domReady(function () {
  $makemeone    = $('#makemeone')
  $monthsRadios = $makemeone.down('.badge.dl [name=dl-months]')
  $packageName  = $makemeone.down('[name=packageName]')

  $packageName
    .on('keydown', function (e) {
      if (e.keyCode == 13)
        e.preventDefault()
    })
    .on('keyup', delayed.cumulativeDelayed(makemeone, 0.3))

  $('.content').on('click', '.copyable', function (e) { e.target.select() })

  $monthsRadios.on('click', updateMonths)

  var pkg = window.location.hash
  if (pkg) {
    $packageName.val(pkg.replace(/^#/, ''))
    makemeone()
  }
})
