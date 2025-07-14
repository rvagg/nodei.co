// Simple badge generator without dependencies
(function () {
  'use strict'

  let packageInput
  let badgeContainer
  let errorContainer
  let validErrorContainer

  // Check if package name is valid (including scoped packages)
  function isValidPackageName (name) {
    // Basic npm package name validation
    if (!name || typeof name !== 'string') return false
    if (name.length > 214) return false
    if (name.startsWith('.') || name.startsWith('_')) return false
    if (/\s/.test(name)) return false

    // Check for scoped package (@scope/package)
    if (name.startsWith('@')) {
      const parts = name.slice(1).split('/')
      if (parts.length !== 2) return false
      return parts[0] && parts[1] &&
        /^[a-z0-9._-]+$/.test(parts[0]) &&
        /^[a-z0-9._-]+$/.test(parts[1])
    }

    // Regular package name
    return /^[a-z0-9._-]+$/.test(name)
  }

  // Check if package exists via API
  async function packageExists (packageName) {
    try {
      // Handle scoped packages by URL encoding them properly
      const encodedPackageName = encodeURIComponent(packageName)
      const response = await fetch(`/api/npm/info/${encodedPackageName}`)
      if (!response.ok) return false
      const data = await response.json()
      return data.name === packageName
    } catch (error) {
      return false
    }
  }

  // Generate embed code blocks
  function generateEmbedCode (packageName, params = '') {
    const baseUrl = 'https://nodei.co'
    const imgUrl = `${baseUrl}/npm/${packageName}.svg${params}`
    const linkUrl = `${baseUrl}/npm/${packageName}/`

    return {
      html: `<a href="${linkUrl}"><img src="${imgUrl}"></a>`,
      markdown: `[![NPM](${imgUrl})](${linkUrl})`
    }
  }

  // Create badge section HTML
  function createBadgeSection (title, packageName, params = '') {
    const { html, markdown } = generateEmbedCode(packageName, params)
    const imgUrl = `/npm/${packageName}.svg${params}`

    return `
      <div class="badge-variant">
        <h4>${title}</h4>
        <div class="badge-display">
          <img src="${imgUrl}" alt="${title} badge">
        </div>
        <div class="embed-codes">
          <div class="embed-code">
            <h5>HTML</h5>
            <pre><code>${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          </div>
          <div class="embed-code">
            <h5>Markdown</h5>
            <pre><code>${markdown}</code></pre>
          </div>
        </div>
      </div>
    `
  }

  // Show error message
  function showError (packageName, isValid) {
    badgeContainer.style.display = 'none'
    errorContainer.style.display = 'none'
    validErrorContainer.style.display = 'none'

    if (!packageName) return

    if (isValid) {
      errorContainer.style.display = 'block'
      errorContainer.querySelector('.package-name').textContent = packageName
    } else {
      validErrorContainer.style.display = 'block'
      validErrorContainer.querySelector('.package-name').textContent = packageName
    }
  }

  // Generate badges for package
  function generateBadges (packageName) {
    const sections = [
      { title: 'Standard', params: '' },
      { title: 'With Stars', params: '?stars=true' },
      { title: 'Compact', params: '?compact=true' },
      { title: 'Mini', params: '?mini=true' }
    ]

    const html = sections.map(section =>
      createBadgeSection(section.title, packageName, section.params)
    ).join('')

    badgeContainer.innerHTML = html
    badgeContainer.style.display = 'block'

    // Update URL hash
    if (window.history && window.history.pushState) {
      window.history.pushState('', '', `${window.location.pathname}#${packageName}`)
    }
  }

  // Handle package lookup
  async function handlePackageLookup () {
    const packageName = packageInput.value.trim()

    // Clear previous state
    errorContainer.style.display = 'none'
    validErrorContainer.style.display = 'none'

    if (!packageName) {
      badgeContainer.style.display = 'none'
      if (window.history && window.history.pushState) {
        window.history.pushState('', '', window.location.pathname)
      }
      return
    }

    const isValid = isValidPackageName(packageName)
    if (!isValid) {
      showError(packageName, false)
      return
    }

    const exists = await packageExists(packageName)
    if (!exists) {
      showError(packageName, true)
      return
    }

    generateBadges(packageName)
  }

  // Debounce function for input handling
  function debounce (func, wait) {
    let timeout
    return function executedFunction (...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    packageInput = document.querySelector('.package-input')
    badgeContainer = document.querySelector('.generated-badges')
    errorContainer = document.querySelector('.package-not-found')
    validErrorContainer = document.querySelector('.package-not-valid')

    if (!packageInput || !badgeContainer || !errorContainer || !validErrorContainer) {
      console.error('Could not find required elements')
      return
    }

    // Set up input handling with debouncing
    const debouncedLookup = debounce(handlePackageLookup, 300)

    packageInput.addEventListener('input', debouncedLookup)
    packageInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handlePackageLookup()
      }
    })

    // Handle initial hash if present
    const hash = window.location.hash
    if (hash && hash.length > 1) {
      packageInput.value = hash.substring(1)
      handlePackageLookup()
    }
  })
})()
