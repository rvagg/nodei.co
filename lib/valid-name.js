// from normalize-package-data/lib/fixer.js
function validName (name) {
  if (name.charAt(0) === '.' ||
      name.match(/[\/@\s\+%:]/) ||
      name !== encodeURIComponent(name) ||
      name.toLowerCase() === 'node_modules' ||
      name.toLowerCase() === 'favicon.ico') {
        return false
  }
  return true
}

module.exports = validName