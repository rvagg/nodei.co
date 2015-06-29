// from normalize-package-data/lib/fixer.js
function isValidScopedPackageName(spec) {
  if (spec.charAt(0) !== '@') return false

  var rest = spec.slice(1).split('/')
  if (rest.length !== 2) return false

  return rest[0] && rest[1] &&
    rest[0] === encodeURIComponent(rest[0]) &&
    rest[1] === encodeURIComponent(rest[1])
}

function isCorrectlyEncodedName(spec) {
  return !spec.match(/[\/@\s\+%:]/) &&
    spec === encodeURIComponent(spec)
}

function ensureValidName (name, strict, allowLegacyCase) {
  if (name.charAt(0) === "." ||
      !(isValidScopedPackageName(name) || isCorrectlyEncodedName(name)) ||
      (strict && (!allowLegacyCase) && name !== name.toLowerCase()) ||
      name.toLowerCase() === "node_modules" ||
      name.toLowerCase() === "favicon.ico") {
        return false
  }
  return true
}

module.exports = function (name) { return ensureValidName(name, false, true) }

// precise: module.exports.pkgregex = '(:?@[A-Za-z0-9]+/)?[^/@\\s\\+%:]+'
// router happy:
module.exports.pkgregex = '@?\\w*/?[^/@\\s\\+%:]+'
// minimal: module.exports.pkgregex = '[^/@\\s\\+%:]+'
