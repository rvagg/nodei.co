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
    const dataCheckboxes = document.querySelectorAll('input[name="data"]:checked')

    let style = 'standard'
    for (const radio of styleRadios) {
      if (radio.checked) {
        style = radio.value
        break
      }
    }

    const params = []

    // Handle style parameter
    if (style !== 'standard') {
      params.push(`style=${style}`)
    }

    // Handle data parameter for all styles that support it
    const dataValues = []
    dataCheckboxes.forEach(checkbox => {
      dataValues.push(checkbox.value)
    })

    if (dataValues.length > 0) {
      // Convert to single-character aliases for compactness
      const aliases = dataValues.map(v => {
        switch (v) {
          case 'name': return 'n'
          case 'version': return 'v'
          case 'updated': return 'u'
          case 'downloads': return 'd'
          case 'stars': return 's'
          default: return v
        }
      })

      // For shields/flat styles, use data parameter
      if (['shields', 'flat', 'flat-square'].includes(style)) {
        params.push(`data=${aliases.join(',')}`)
      } else if (style === 'standard') {
        // For standard style, also use data parameter
        params.push(`data=${aliases.join(',')}`)
      }
    }

    return params.length > 0 ? '?' + params.join('&') : ''
  }

  // Update UI based on selected style
  function updateOptionsVisibility () {
    const styleRadios = document.querySelectorAll('input[name="style"]')
    const dataOptionGroup = document.querySelector('.option-group:has(.data-options)') ||
                           document.querySelectorAll('.option-group')[1] // Fallback for older browsers

    let selectedStyle = 'standard'
    for (const radio of styleRadios) {
      if (radio.checked) {
        selectedStyle = radio.value
        break
      }
    }

    // Show/hide data options based on style
    if (['shields', 'flat', 'flat-square'].includes(selectedStyle)) {
      // New styles support all data options
      dataOptionGroup.style.display = 'flex'
      // Reset visibility for all data options
      document.querySelectorAll('.data-option').forEach(option => {
        option.style.display = 'inline-block'
      })
    } else if (selectedStyle === 'standard') {
      // Standard style only supports stars and downloads
      dataOptionGroup.style.display = 'flex'
      // Hide version, updated and name checkboxes for standard style
      document.querySelectorAll('input[value="version"], input[value="updated"], input[value="name"]').forEach(checkbox => {
        checkbox.parentElement.style.display = 'none'
      })
      // Show stars and downloads checkboxes
      document.querySelectorAll('input[value="stars"], input[value="downloads"]').forEach(checkbox => {
        checkbox.parentElement.style.display = 'inline-block'
      })
    } else {
      // Compact and mini don't support data options - hide entire group
      dataOptionGroup.style.display = 'none'
      // Uncheck all data options
      document.querySelectorAll('input[name="data"]').forEach(checkbox => {
        checkbox.checked = false
      })
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

  // Create badge section DOM element
  function createBadgeSection (title, packageName, params = '') {
    const { html, markdown } = generateEmbedCode(packageName, params)
    const imgUrl = `/npm/${packageName}.svg${params}`
    const shortUrl = `nodei.co/npm/${packageName}.svg${params}`

    // Create main container
    const badgeResult = document.createElement('div')
    badgeResult.className = 'badge-result'

    // Create image container
    const imageContainer = document.createElement('div')
    imageContainer.style.textAlign = 'center'
    imageContainer.style.marginBottom = '20px'

    const img = document.createElement('img')
    img.src = imgUrl
    img.alt = title + ' badge'
    imageContainer.appendChild(img)
    badgeResult.appendChild(imageContainer)

    // Create embed codes container
    const embedCodes = document.createElement('div')
    embedCodes.className = 'embed-codes'

    // Helper function to create copy field sections
    function createCopyField (labelText, value) {
      const wrapper = document.createElement('div')
      wrapper.className = labelText.toLowerCase() === 'url' ? 'url-display-wrapper' : 'code-display-wrapper'

      const label = document.createElement('label')
      label.textContent = labelText
      wrapper.appendChild(label)

      const copyWrapper = document.createElement('div')
      copyWrapper.className = 'copy-field-wrapper'

      const input = document.createElement('input')
      input.type = 'text'
      input.className = labelText.toLowerCase() === 'url' ? 'url-copy-field' : 'code-copy-field'
      input.value = value
      input.readOnly = true
      input.addEventListener('click', function () { this.select() })
      copyWrapper.appendChild(input)

      const button = document.createElement('button')
      button.className = 'copy-btn'
      button.textContent = '📋'
      button.title = 'Copy to clipboard'
      button.addEventListener('click', function () { window.copyFieldValue(this) })
      copyWrapper.appendChild(button)

      wrapper.appendChild(copyWrapper)
      return wrapper
    }

    // Add the three copy fields
    embedCodes.appendChild(createCopyField('URL', shortUrl))
    embedCodes.appendChild(createCopyField('HTML', html))
    embedCodes.appendChild(createCopyField('Markdown', markdown))

    badgeResult.appendChild(embedCodes)
    return badgeResult
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

    // Get current style
    const styleRadios = document.querySelectorAll('input[name="style"]')
    let style = 'standard'
    for (const radio of styleRadios) {
      if (radio.checked) {
        style = radio.value
        break
      }
    }

    // Determine title based on style and options
    let title = 'Standard Badge'
    if (style === 'compact') {
      title = 'Compact Badge'
    } else if (style === 'mini') {
      title = 'Mini Badge'
    } else if (style === 'shields') {
      title = 'Shields Style Badge'
    } else if (style === 'flat') {
      title = 'Flat Style Badge'
    } else if (style === 'flat-square') {
      title = 'Flat Square Style Badge'
    } else if (style === 'standard') {
      // For standard style, check if data options are selected
      if (params.includes('stars=true') && params.includes('downloads=true')) {
        title = 'Badge with Stars & Downloads'
      } else if (params.includes('stars=true')) {
        title = 'Badge with Stars'
      } else if (params.includes('downloads=true')) {
        title = 'Badge with Downloads'
      }
    }

    const badgeElement = createBadgeSection(title, packageName, params)

    // Clear existing content and append new element
    badgeContainer.textContent = ''
    badgeContainer.appendChild(badgeElement)
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

  // Copy field value function
  window.copyFieldValue = function (button) {
    const input = button.previousElementSibling
    input.select()

    try {
      document.execCommand('copy')
      // Show brief success feedback on button
      const originalText = button.textContent
      button.textContent = '✓'
      button.style.backgroundColor = '#4caf50'
      button.style.color = 'white'
      setTimeout(() => {
        button.textContent = originalText
        button.style.backgroundColor = ''
        button.style.color = ''
      }, 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Add smooth scrolling for CTA button
  window.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    })
  })

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

    // Handle data option changes
    document.querySelectorAll('input[name="data"]').forEach(checkbox => {
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
