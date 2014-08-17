var $         = require('./ender')
  , delayed   = require('delayed')
  , validName = require('../lib/valid-name')

  , $makemeone
  , $packageName
  , $monthsRadios
  , $histogramHeightRadios
  , $optionsCheckboxes
  , selectedMonths          = 12
  , selectedHistogramHeight = 1
  , selectedOptions         = {
        downloads    : true
      , downloadRank : true
      , stars        : true
    }

  , tmpl = {
        plain: {
            img  : '<img src="/npm/{pkg}.png">'
          , code : '<textarea class="copyable" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm/{pkg}.png"></a></textarea>'
                 + '<textarea class="copyable" readonly>[![NPM](https://nodei.co/npm/{pkg}.png)](https://nodei.co/npm/{pkg}/)</textarea>'
        }
      , 'all-options': {
            img  : '<img src="/npm/{pkg}.png{params}">'
          , code : '<textarea class="copyable double" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm/{pkg}.png{params}"></a></textarea>'
                 + '<textarea class="copyable double" readonly>[![NPM](https://nodei.co/npm/{pkg}.png{params})](https://nodei.co/npm/{pkg}/)</textarea>'
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
            img  : '<img src="/npm-dl/{pkg}.png{params}">'
          , code : '<textarea class="copyable double" readonly><a href="https://nodei.co/npm/{pkg}/"><img src="https://nodei.co/npm-dl/{pkg}.png{params}"></a></textarea>'
                 + '<textarea class="copyable double" readonly>[![NPM](https://nodei.co/npm-dl/{pkg}.png{params})](https://nodei.co/npm/{pkg}/)</textarea>'
        }
    }

function tmplpkg (tmpl, pkg, params) {
  return tmpl
    .replace(/\{pkg\}/g, pkg)
    .replace(/\{params\}/g, params || '')
}

function packageExists (pkg, callback) {
  $.ajax({
      url: '/api/npm/info/' + pkg
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
    updateDownloadOptions()
    updateOptions()
  })
}

function placeBadge(type, pkg) {
  var t = tmpl[type]
    , imgHtml
    , codeHtml
    , paramsA
    , k
    , params

  if (type == 'all-options') {
    paramsA = []
    for (k in selectedOptions) {
      if (selectedOptions.hasOwnProperty(k) && selectedOptions[k] === true)
        paramsA.push(k + '=true')
    }
    params = paramsA.length ? '?' + paramsA.join('&') : ''
    imgHtml = tmplpkg(t['img'], pkg, params)
    codeHtml = tmplpkg(t['code'], pkg, params)
  } else if (type == 'dl') {
    paramsA = []
    if (selectedMonths != 12)
      paramsA.push('months=' + selectedMonths)
    if (selectedHistogramHeight != 1)
      paramsA.push('height=' + selectedHistogramHeight)
    params = paramsA.length ? '?' + paramsA.join('&') : ''
    imgHtml = tmplpkg(t['img'], pkg, params)
    codeHtml = tmplpkg(t['code'], pkg, params)
  } else {
    imgHtml  = tmplpkg(t['img'], pkg)
    codeHtml = tmplpkg(t['code'], pkg)
  }

  $makemeone.down('.badge.' + type + ' .img').html(imgHtml)
  $makemeone.down('.badge.' + type + ' .code').html(codeHtml)
}

function placeBadges (pkg, justMonths) {
  if (justMonths)
    return placeBadge('dl', pkg)
  Object.keys(tmpl).forEach(function (k) { placeBadge(k, pkg) })
}

function updateDownloadOptions () {
  selectedMonths = $monthsRadios.filter(function () { return this.checked }).val() || 12
  selectedHistogramHeight = $histogramHeightRadios.filter(function () { return this.checked }).val() || 1
  placeBadges($packageName.val(), true)
}

function updateOptions () {
  var k

  for (k in selectedOptions) {
    if (!selectedOptions.hasOwnProperty(k))
      continue

    selectedOptions[k] = $('#opt-' + k)[0] && $('#opt-' + k)[0].checked
  }

  placeBadge('all-options', $packageName.val())
}

$.domReady(function () {
  $makemeone             = $('#makemeone')
  $monthsRadios          = $makemeone.down('.badge.dl [name=dl-months]')
  $histogramHeightRadios = $makemeone.down('.badge.dl [name=dl-height]')
  $optionsCheckboxes     = $makemeone.down('.badge.all-options [type=checkbox]')
  $packageName           = $makemeone.down('[name=packageName]')

  $packageName
    .on('keydown', function (e) {
      if (e.keyCode == 13)
        e.preventDefault()
    })
    .on('keyup', delayed.cumulativeDelayed(makemeone, 0.3))

  $('.content').on('click', '.copyable', function (e) { e.target.select() })

  $monthsRadios.on('click', updateDownloadOptions)
  $histogramHeightRadios.on('click', updateDownloadOptions)
  $optionsCheckboxes.on('click', updateOptions)

  var pkg = window.location.hash
  if (pkg) {
    $packageName.val(pkg.replace(/^#/, ''))
    makemeone()
  }
})
