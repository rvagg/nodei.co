'use strict'

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
    , gubblebum   = new Canvas.Font('gubblebum', Gubblebum)
    , ubuntumonob = new Canvas.Font('ubuntu-b', UbuntuMonoB)
    , ubuntumonor = new Canvas.Font('ubuntu-r', UbuntuMonoR)

    , INSET  = 2
    , MARGIN = 4
    , UNAVAILABLE_TEXT = [ 'Download stats from npm', 'are currently unavailable' ]


function drawInit (ctx) {
  ctx.addFont(gubblebum)
  ctx.addFont(ubuntumonob)
  ctx.addFont(ubuntumonor)
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

function drawLogo (ctx, margin) {
  ctx.font = 'bold 50px gubblebum'
  ctx.fillStyle = 'rgb(203, 56, 55)'
  ctx.textBaseline = 'top'
  ctx.fillText('npm', margin + 7, 1)
}

function drawTitle (ctx, margin, label) {
  ctx.font = '14px ubuntu-b'
  ctx.fillStyle = 'rgb(102, 102, 102)'
  ctx.textBaseline = 'top'
  ctx.fillText(label, margin + 106, margin)
}

function drawUnavailable (ctx, margin, height, width) {
  ctx.font = '12px ubuntu-r'
  ctx.fillStyle = 'rgb(102, 102, 102)'
  ctx.textBaseline = 'top'
  ctx.fillText(UNAVAILABLE_TEXT[0], width - margin - (6.1 * UNAVAILABLE_TEXT[0].length), height - (margin * 2) - 24)
  ctx.fillText(UNAVAILABLE_TEXT[1], width - margin - (6.1 * UNAVAILABLE_TEXT[1].length), height - (margin * 2) - 12)
}

function dayDownloads (downloads, day) {
  let k = day.format('YYYY-MM-DD')
    , i = 0
  for (; i < downloads.length; i++)
    if (downloads[i].day == k)
      return downloads[i].count
  return 0
}

function drawHistogram (ctx, margin, months, downloads, days, width, height, max, maxText) {
  let day   = moment().subtract(months, 'months')
    , today = moment()
    , x1    = margin + 106
    , y1    = margin
    , y2    = margin + height
    , h     = y2 - y1
    , inc   = width / days
    , i     = 0
    , dl
    , x
    , y

  ctx.lineWidth = Math.min(Math.max(1, Math.floor(width / days)), 4)

  while (day <= today) {
    dl = dayDownloads(downloads, day)
    if (dl) {
      x = x1 + i * inc
      y = y2 - (dl / max) * h
      ctx.beginPath()
      ctx.moveTo(x, y2)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    day = day.add(1, 'days')
    i++
  }

  ctx.font = '10px ubuntu-r'
  ctx.fillStyle = 'rgb(120, 120, 120)'
  ctx.textBaseline = 'top'
  ctx.fillText(
      maxText
    , margin + 106 + width + 2
    , margin - 1
  )
  ctx.textBaseline = 'bottom'
  ctx.fillText(
      '0'
    , margin + 106 + width + 2
    , margin + h + 1
  )
}

// 10px ubuntu-r is 6 wide
// 14px ubuntu-b is 7 wide
function draw (options, pkginfo) {
  let margin       = MARGIN
    , months       = options.downloads
    , max          = Array.isArray(pkginfo.downloadDays)
        ? pkginfo.downloadDays.reduce(function (p, c) {
            return Math.max(p, c.count)
          }, 0)
        : 0
    , label        = `${pkginfo.name} downloads (${months} month${months == 1 ? '' : 's'})`
    , labelRight   = margin + 106 + 7 * label.length
    , days         = moment().diff(moment().subtract(months, 'months'), 'days')
    , histRight    = margin + 106 + days
    , maxText      = humanize(max)
    , maxTextWidth = 6 * maxText.length
    //, maxTextRight = histRight + maxTextWidth
    , barHeight    = options.height === 2
                        ? 61
                        : options.height === 3
                          ? 73
                          : 48
    , height       = margin * 2 + barHeight
    , width        = Math.max(labelRight, histRight) + maxTextWidth + margin + 3
    , canvas       = new Canvas(width, height)
    , ctx          = canvas.getContext('2d')

  drawInit(ctx)
  drawBox(ctx, margin, INSET, height, width)
  drawLogo(ctx, margin)

  if (pkginfo.downloadDays) {
    drawHistogram(
        ctx
      , margin
      , months
      , pkginfo.downloadDays
      , days
      , labelRight > margin + 106 + days ? 7 * label.length : days
      , barHeight
      , max
      , maxText
    )
  } else {
    drawUnavailable(ctx, margin, height, width)
  }

  drawTitle(ctx, margin, label)

  return canvas
}

module.exports = draw
