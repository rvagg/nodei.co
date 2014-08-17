function ordinalSuffix (x) {
  var j = x % 10
    , k = x % 100

  if (j == 1 && k != 11)
    return 'st'

  if (j == 2 && k != 12)
    return 'nd'

  if (j == 3 && k != 13)
    return 'rd'

  return 'th'
}


module.exports = ordinalSuffix