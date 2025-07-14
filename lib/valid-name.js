'use strict' // cannot be ES6, used in the browser

// from normalize-package-data/lib/fixer.js
function isValidScopedPackageName (spec) {
  if (spec.charAt(0) !== '@') return false

  const rest = spec.slice(1).split('/')
  if (rest.length !== 2) return false

  return rest[0] && rest[1] &&
    rest[0] === encodeURIComponent(rest[0]) &&
    rest[1] === encodeURIComponent(rest[1])
}

function isCorrectlyEncodedName (spec) {
  return !spec.match(/[/@\s+%:]/) &&
    spec === encodeURIComponent(spec)
}

function ensureValidName (name, strict, allowLegacyCase) {
  if (name.charAt(0) === '.' ||
      !(isValidScopedPackageName(name) || isCorrectlyEncodedName(name)) ||
      (strict && (!allowLegacyCase) && name !== name.toLowerCase()) ||
      name.toLowerCase() === 'node_modules' ||
      name.toLowerCase() === 'favicon.ico') {
    return false
  }
  return true
}

const validName = function (name) { return ensureValidName(name, false, true) }

// precise: pkgregex = '(:?@[A-Za-z0-9]+/)?[^/@\\s\\+%:]+'
// router happy:
export const pkgregex = '@?\\w*/?[^/@\\s+%:]+'
// minimal: pkgregex = '[^/@\\s\\+%:]+'

export default validName
