const Canvas      = require('canvas')
    , path        = require('path')
    , moment      = require('moment')
    , humanize    = require('humanize-number')
    , validName   = require('./valid-name')

function fontPath (file) {
  return path.join(__dirname, '../fonts', file)
}

const Gubblebum   = fontPath('GUBBLO___.ttf')
    , UbuntuMonoB = fontPath('UbuntuMono-B.ttf')
    , UbuntuMonoR = fontPath('UbuntuMono-R.ttf')
    , Octicons    = fontPath('Octicons.ttf')
    , gubblebum   = new Canvas.Font('gubblebum', Gubblebum)
    , ubuntumonob = new Canvas.Font('ubuntu-b', UbuntuMonoB)
    , ubuntumonor = new Canvas.Font('ubuntu-r', UbuntuMonoR)
    , octicons    = new Canvas.Font('octicons', Octicons)

    , INSET  = 2
    , MARGIN = 4

function drawInit (ctx, showStars) {
  ctx.addFont(gubblebum)
  ctx.addFont(ubuntumonob)
  ctx.addFont(ubuntumonor)
  if (showStars)
    ctx.addFont(octicons)

  ctx.antialias = 'subpixel'
}

function drawBox (ctx, margin, inset, height, width) {
  ctx.strokeStyle = 'rgb(203, 56, 55)'
  ctx.fillStyle = 'rgb(244, 244, 242)'
  ctx.lineCap = 'butt'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.lineTo(inset, inset)
  ctx.lineTo(width - inset, inset)
  ctx.lineTo(width - inset, height - inset)
  ctx.lineTo(inset, height - inset)
  ctx.lineTo(inset, inset)
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
}

function drawLogo (ctx, margin, style) {
  ctx.font = style == 'mini'
    ? 'bold 22px gubblebum'
    : style == 'compact'
        ? 'bold 40px gubblebum'
        : 'bold 50px gubblebum'
  ctx.fillStyle = 'rgb(203, 56, 55)'
  ctx.textBaseline = 'top'
  ctx.fillText('npm', style == 'mini' ? 5 : margin + 7, style == 'mini' ? 0 : 1)
}

function drawNpmInstall (ctx, margin, name, style) {
  ctx.font = '14px ubuntu-b'
  ctx.fillStyle = 'rgb(102, 102, 102)'
  ctx.textBaseline = 'top'
  ctx.fillText(
      'npm install ' + name
    , margin + (style == 'mini'
        ? 50
        : style == 'compact'
          ? 86
          : 106)
    , margin + 3
  )
}

function drawDeps (ctx, margin, dependencies, depended) {
  ctx.font = '13px ubuntu-r'
  ctx.fillText(
        (dependencies || 0)
      + ' dependenc'
      + (dependencies === 1 ? 'y' : 'ies')
    , margin + 106
    , margin + 19
  )
  ctx.fillText(
        humanize(depended) // for limit:1000 (depended == 1000 ? '1000+' : depended)
      + ' dependent'
      + (depended === 1 ? '' : 's')
    , margin + 106
    , margin + 31
  )
}

function drawDownloads (ctx, margin, downloads) {
  var total = downloads.reduce(function (p, c) { return p + c.count }, 0)
  ctx.font = '13px ubuntu-r'
  ctx.fillText(
        humanize(total)
      + ' download'
      + (total === 1 ? '' : 's')
      + ' in the last month'
    , margin + 106
    , margin + 43
  )
}

function drawStars (ctx, margin, stars) {
  var starText = humanize(stars)
    , totlen = (starText.length * 7) + 10
    , center = margin + 50

  ctx.font = '13px ubuntu-r'
  ctx.fillText(starText, center - (totlen / 2), margin + 43)
  ctx.font = '12px octicons'
  ctx.fillText('\uf02a', center + (totlen / 2) - 7, margin + 43.5)
  ctx.font = '13px ubuntu-r'
}

function draw (options, pkginfo) {
  var margin        = options.mini ? 1 : MARGIN
    , installName   = pkginfo.name + (pkginfo.preferGlobal ? ' -g' : '')
    , versionText   = 'version ' + pkginfo.version
    , updatedText   = 'updated ' + moment(pkginfo.updated).fromNow()
    , compactText   = options.compact
                   && ('v' + pkginfo.version + ' ' + updatedText)
    , versionPos    = margin + 236 + 11 + 7 * versionText.length
    , updatedPos    = margin + 236 + 11 + 7 * updatedText.length
    , compactPos    = options.compact
                   && margin + 86  + 11 + 7 * compactText.length
    , textPos       = margin + (options.mini ? 50 : options.compact ? 86 : 106)
                    + 81 + 11 + 7 * installName.length
    , showDownloads = options.downloads && !!pkginfo.downloads
    , showStars     = options.stars && !!pkginfo.stars

    , height = margin * 2 + (options.mini
        ? 22
        : options.compact
            ? 37
            : showDownloads || showStars ? 61 : 48)
    , width  = options.mini
        ? textPos
        : Math.max.apply(null, options.compact
            ? [ compactPos, textPos ]
            : [ updatedPos, versionPos, textPos ]
      )
    , canvas = new Canvas(width, height)
    , ctx    = canvas.getContext('2d')
    , style  = options.mini
        ? 'mini'
        : options.compact
            ? 'compact'
            : 'standard'

  drawInit(ctx, showStars)
  drawBox(ctx, margin, INSET, height, width)
  drawLogo(ctx, margin, style)
  drawNpmInstall(ctx, margin, installName, style)

  ctx.font = '13px ubuntu-r'
  if (!options.mini) {
    if (options.compact) {
      ctx.fillText(compactText, margin + 86, margin + 19)
    } else {
      drawDeps(ctx, margin, pkginfo.dependencies, pkginfo.depended)

      ctx.fillText(versionText, margin + 236, margin + 19)
      ctx.fillText(updatedText, margin + 236, margin + 31)

      if (showDownloads)
        drawDownloads(ctx, margin, pkginfo.downloads)

      if (showStars)
        drawStars(ctx, margin, pkginfo.stars)
    }
  }

  return canvas
}

module.exports = draw