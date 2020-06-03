'use strict'

const Canvas        = require('canvas')
    , path          = require('path')
    , moment        = require('moment')
    , humanize      = require('humanize-number')
    , validName     = require('./valid-name')
    , ordinalSuffix = require('./ordinal-suffix')


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
      `npm install ${name}`
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
      `${(dependencies || 0)} dependenc${dependencies === 1 ? 'y' : 'ies'}`
    , margin + 106
    , margin + 19
  )

  if (typeof depended === 'number') {
    ctx.fillText(
        `${humanize(depended)} dependent${depended === 1 ? '' : 's'}`
      , margin + 106
      , margin + 19 + 12
    )
  }
}


function drawDownloads (ctx, margin, downloadsText) {
  ctx.font = '13px ubuntu-r'
  ctx.fillText(
      downloadsText
    , margin + 106
    , margin + 19 + 12 * 2
  )
}


function drawDownloadRank (ctx, margin, showDownloads, downloadRankText) {
  ctx.font = '13px ubuntu-r'
  ctx.fillText(
      downloadRankText
    , margin + 106
    , margin + 19 + 12 * (showDownloads ? 3 : 2)
  )
}


function drawStars (ctx, margin, stars) {
  let starText = humanize(stars)
    , totlen = (starText.length * 7) + 10
    , center = margin + 50

  ctx.font = '13px ubuntu-r'
  ctx.fillText(starText, center - (totlen / 2), margin + 43)
  ctx.font = '12px octicons'
  ctx.fillText('\uf02a', center + (totlen / 2) - 7, margin + 43.5)
  ctx.font = '13px ubuntu-r'
}


function downloadRankDescriptor (ranking) {
  if (ranking.rank < 500)
    return humanize(ranking.rank) + ordinalSuffix(ranking.rank)

  let pr = (ranking.rank / ranking.total) * 100
    , i

  for (i = 1; i <= 10; i++) {
    if (pr <= i)
      return `top ${i}%`
  }

  for (i = 20; i <= 60; i += 5) {
    if (pr <= i)
      return `top ${i}%`
  }

  for (i = 70; i <= 100; i += 10) {
    if (pr <= i)
      return `bottom ${110 - i}%`
  }
}


function calculateParams (options, pkginfo) {
  let margin        = options.mini ? 1 : MARGIN
    , installName   = `${pkginfo.name}${pkginfo.preferGlobal ? ' -g' : ''}`
    , versionText   = !!pkginfo.version ? `version ${pkginfo.version}` : ''
    , updatedText   = !!pkginfo.updated ? `updated ${moment(pkginfo.updated).fromNow()}` : ''
    , compactText   = options.compact
                        && ((pkginfo.version !== undefined ? `v${pkginfo.version}` : '')
                          + ` ${updatedText}`)
    , versionPos    = margin + 236 + 11 + 7 * versionText.length
    , updatedPos    = margin + 236 + 11 + 7 * updatedText.length
    , compactPos    = options.compact
                        && margin + 86  + 11 + 7 * compactText.length
    , textPos       = margin + (options.mini ? 50 : options.compact ? 86 : 106)
                        + 81 + 11 + 7 * installName.length
    , showDownloads = options.downloadSum && pkginfo.downloadSum !== undefined
    , downloads     = pkginfo.downloadSum || 0
    , downloadsText = showDownloads
                        ? `${humanize(downloads)} download${downloads === 1 ? '' : 's'} in the last month`
                        : ''
    , downloadsPos  = margin + 106 + 11 + 7 * downloadsText.length
    , showDownloadRank = options.downloadRank && pkginfo.ranking && pkginfo.ranking.rank > 0
    , totalPackages = showDownloadRank ? Math.round(pkginfo.ranking.total / 500) * 500 : 1
    , downloadRankText = showDownloadRank
                        ? `download rank: ${downloadRankDescriptor(pkginfo.ranking)} of ${humanize(totalPackages)} packages`
                        : ''
    , downloadRankPos = margin + 106 + 11 + 7 * downloadRankText.length
    , showStars     = options.stars && pkginfo.stars !== undefined

  return {
      margin        : margin
    , inset         : INSET
    , installName   : installName
    , versionText   : versionText
    , updatedText   : updatedText
    , compactText   : compactText
    , versionPos    : versionPos
    , updatedPos    : updatedPos
    , compactPos    : compactPos
    , textPos       : textPos
    , showDownloads : showDownloads
    , downloadsText : downloadsText
    , showDownloadRank : showDownloadRank
    , downloadRankText : downloadRankText
    , showStars     : showStars
    , height        : margin * 2 + (options.mini
                        ? 22
                        : options.compact
                            ? 37
                            : showDownloads || showStars || showDownloadRank
                                ? showDownloadRank && showDownloads ? 73 : 61
                                : 48)
    , width         : options.mini
                        ? textPos
                        : Math.max.apply(null, options.compact
                            ? [ compactPos, textPos ]
                            : [ updatedPos, versionPos, textPos, downloadsPos, downloadRankPos ]
                          )
    , style         : options.mini
                        ? 'mini'
                        : options.compact ? 'compact' : 'standard'
  }
}


function draw (options, pkginfo) {
  let params = calculateParams(options, pkginfo)
    , canvas = new Canvas(params.width, params.height)
    , ctx    = canvas.getContext('2d')

  drawInit(ctx, params.showStars)
  drawBox(ctx, params.margin, params.inset, params.height, params.width)
  drawLogo(ctx, params.margin, params.style)
  drawNpmInstall(ctx, params.margin, params.installName, params.style)

  ctx.font = '13px ubuntu-r'
  if (!options.mini) {
    if (options.compact) {
      ctx.fillText(params.compactText, params.margin + 86, params.margin + 19)
    } else {
      if (pkginfo.dependencies !== undefined) // && pkginfo.depended !== undefined)
        drawDeps(ctx, params.margin, pkginfo.dependencies, pkginfo.depended)

      ctx.fillText(params.versionText, params.margin + 236, params.margin + 19)
      ctx.fillText(params.updatedText, params.margin + 236, params.margin + 31)

      if (params.showDownloads) // if download data not available, just skip it
        drawDownloads(ctx, params.margin, params.downloadsText)

      if (params.showDownloadRank) // if rank data not available, just skip it
        drawDownloadRank(ctx, params.margin, params.showDownloads, params.downloadRankText)

      if (params.showStars)
        drawStars(ctx, params.margin, pkginfo.stars)
    }
  }

  return canvas
}

module.exports                 = draw
module.exports.calculateParams = calculateParams
