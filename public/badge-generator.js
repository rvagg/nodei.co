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

  // Get selected options from the form
  function getSelectedOptions () {
    const styleRadios = document.querySelectorAll('input[name="style"]')
    const starsCheckbox = document.querySelector('input[name="stars"]')
    const downloadsCheckbox = document.querySelector('input[name="downloads"]')

    let style = 'standard'
    for (const radio of styleRadios) {
      if (radio.checked) {
        style = radio.value
        break
      }
    }

    const params = []
    if (style === 'compact') params.push('compact=true')
    if (style === 'mini') params.push('mini=true')
    if (style === 'standard' && starsCheckbox && starsCheckbox.checked) params.push('stars=true')
    if (style === 'standard' && downloadsCheckbox && downloadsCheckbox.checked) params.push('downloads=true')

    return params.length > 0 ? '?' + params.join('&') : ''
  }

  // Update UI based on selected style
  function updateOptionsVisibility () {
    const styleRadios = document.querySelectorAll('input[name="style"]')
    const standardOnlyOptions = document.querySelectorAll('.standard-only')

    let selectedStyle = 'standard'
    for (const radio of styleRadios) {
      if (radio.checked) {
        selectedStyle = radio.value
        break
      }
    }

    // Show/hide stars and downloads options based on style
    standardOnlyOptions.forEach(option => {
      if (selectedStyle === 'standard') {
        option.classList.remove('disabled')
        option.querySelector('input').disabled = false
      } else {
        option.classList.add('disabled')
        option.querySelector('input').disabled = true
        option.querySelector('input').checked = false
      }
    })
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
    const params = getSelectedOptions()

    // Determine title based on selected options
    let title = 'Standard Badge'
    if (params.includes('compact=true')) {
      title = 'Compact Badge'
    } else if (params.includes('mini=true')) {
      title = 'Mini Badge'
    } else if (params.includes('stars=true') && params.includes('downloads=true')) {
      title = 'Badge with Stars & Downloads'
    } else if (params.includes('stars=true')) {
      title = 'Badge with Stars'
    } else if (params.includes('downloads=true')) {
      title = 'Badge with Downloads'
    }

    const html = createBadgeSection(title, packageName, params)

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

    // Initialize option visibility
    updateOptionsVisibility()

    // Set up input handling with debouncing
    const debouncedLookup = debounce(handlePackageLookup, 300)

    packageInput.addEventListener('input', debouncedLookup)
    packageInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handlePackageLookup()
      }
    })

    // Handle style changes
    document.querySelectorAll('input[name="style"]').forEach(radio => {
      radio.addEventListener('change', () => {
        updateOptionsVisibility()
        if (packageInput.value && badgeContainer.style.display === 'block') {
          generateBadges(packageInput.value)
        }
      })
    })

    // Handle stars/downloads changes
    document.querySelectorAll('input[name="stars"], input[name="downloads"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (packageInput.value && badgeContainer.style.display === 'block') {
          generateBadges(packageInput.value)
        }
      })
    })

    // Handle initial hash if present
    const hash = window.location.hash
    if (hash && hash.length > 1) {
      packageInput.value = hash.substring(1)
      handlePackageLookup()
    }
  })
})()
