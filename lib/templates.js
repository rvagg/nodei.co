// Template rendering using native JavaScript template strings
import { escapeHtml } from './html-escape.js'

function humanize (num) {
  if (typeof num !== 'number') return String(num)
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num)
}

// NPM logo SVG content
const npmLogo = `<path fill="rgb(203, 56, 55)" d="M0,0H499.36c0.05,55.66,0.021,111.32,0.021,166.98c-83.221,0.039-166.44-0.051-249.66,0.049  c-0.07,9.32,0.14,18.65-0.11,27.971H138.8c-0.03-9.33,0-18.67-0.01-28C92.53,166.96,46.26,167,0,166.98V0z"/>
<path fill="rgb(244, 244, 242)" d="M27.73,28.02c37.021,0,74.05-0.01,111.07,0c-0.021,37.08,0.01,74.15-0.01,111.22  c-9.311,0-18.61,0.029-27.92-0.02c-0.021-27.801,0.01-55.591-0.011-83.391c-9.1-0.08-18.21,0.13-27.31-0.11  c-0.44,27.82-0.05,55.67-0.19,83.5c-18.55,0.049-37.09,0.02-55.63,0.02C27.72,102.17,27.73,65.09,27.73,28.02z"/>
<path fill="rgb(244, 244, 242)" d="M166.7,28.02c36.88-0.01,73.76-0.01,110.64,0c0,37.08,0.01,74.15-0.01,111.23  c-18.351-0.02-36.7,0.01-55.061-0.02c0.01,9.199-0.029,18.399,0.03,27.609c-18.53,0.34-37.07,0.051-55.6,0.141  C166.69,120.66,166.69,74.34,166.7,28.02z"/>
<path fill="rgb(244, 244, 242)" d="M305.27,28.03c55.47-0.03,110.95-0.03,166.42,0c-0.1,37.09,0.15,74.191-0.13,111.281  c-9.25-0.16-18.49,0-27.74-0.09c-0.01-27.791,0-55.591,0-83.391c-9.229-0.02-18.45,0-27.67,0c-0.02,27.81,0.01,55.609-0.01,83.42  c-9.24,0.02-18.47-0.07-27.71,0.04c-0.229-27.819-0.02-55.65-0.1-83.47c-9.24,0.02-18.471-0.01-27.71,0.02  c-0.091,27.82,0.149,55.65-0.12,83.471c-18.431-0.23-36.86,0.14-55.29-0.19C305.37,102.09,305.25,65.06,305.27,28.03z"/>
<path fill="rgb(203, 56, 55)" d="M222.37,111.439c-0.11-18.569-0.29-37.169,0.09-55.729c9.1,0.34,18.22-0.12,27.319,0.24  c-0.21,18.49,0.091,36.99-0.149,55.47C240.54,111.33,231.45,111.3,222.37,111.439z"/>`

export function renderBadge (ctx) {
  const { options, params, pkginfo } = ctx

  // Generate NPM logo placement based on badge type
  let logoSection = ''
  if (!options.mini) {
    if (params.style === 'compact') {
      logoSection = `
      <g transform="translate(${params.margin + 7}, ${params.margin + 5})">
        <g transform="scale(0.15)">
          ${npmLogo}
        </g>
      </g>`
    } else {
      logoSection = `
      <g transform="translate(${params.margin + 7}, ${params.margin + 7})">
        <g transform="scale(0.18)">
          ${npmLogo}
        </g>
      </g>`
    }
  } else {
    logoSection = `
    <!-- Mini version npm logo -->
    <g transform="translate(${params.margin + 4}, ${params.margin + 3.5})">
      <g transform="scale(0.08)">
        ${npmLogo}
      </g>
    </g>`
  }

  // Generate install command text
  let installX
  if (options.mini) {
    installX = params.margin + 50
  } else if (options.compact) {
    installX = params.margin + 95
  } else {
    installX = params.margin + 110
  }

  const installSection = `
  <text x="${installX}" y="${params.margin + 15}" class="install-text">
    npm install ${params.installName}
  </text>`

  // Generate content section
  let contentSection = ''
  if (!options.mini) {
    if (options.compact) {
      contentSection = `
      <!-- Compact layout -->
      <text x="${params.margin + 95}" y="${params.margin + 30}" class="main-text">
        ${params.compactText}
      </text>`
    } else {
      // Standard layout
      contentSection = `
      <!-- Standard layout -->

      <!-- Version and updated -->
      <text x="${params.margin + 110}" y="${params.margin + 30}" class="main-text">
        ${params.versionText}
      </text>
      <text x="${params.margin + 110}" y="${params.margin + 42}" class="main-text">
        ${params.updatedText}
      </text>`

      // Add stars and/or downloads on the same line
      const extraY = params.margin + 56

      // Add stars if enabled
      if (params.showStars) {
        const starText = humanize(pkginfo.stars || 0)
        const starTextWidth = starText.length * 7.2 + 2 // Minimal increase + very modest padding
        const center = params.margin + 50

        contentSection += `
      <!-- Stars -->
      <text x="${center - (starTextWidth + 10) / 2}" y="${extraY}" class="main-text">
        ${starText}
      </text>
      <text x="${center + (starTextWidth + 10) / 2 - 7}" y="${extraY + 0.5}" class="star-icon">
        ★
      </text>`
      }

      // Add downloads if enabled
      if (params.showDownloads) {
        contentSection += `
      <!-- Downloads -->
      <text x="${params.margin + 110}" y="${extraY}" class="main-text">
        ${params.downloadsText}
      </text>`
      }
    }
  }

  return `<svg version="1.1"
    baseProfile="full"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    width="${params.width}px"
    height="${params.height}px"
    viewBox="0 0 ${params.width} ${params.height}"
  >

  <style>
    .main-text {
      font-family: 'Courier New', Courier, 'DejaVu Sans Mono', 'Liberation Mono', Monaco, monospace;
      font-size: 11px;
      fill: rgb(102, 102, 102);
    }
    .install-text {
      font-family: 'Courier New', Courier, 'DejaVu Sans Mono', 'Liberation Mono', Monaco, monospace;
      font-size: 12px;
      font-weight: bold;
      fill: rgb(102, 102, 102);
    }
    .star-icon {
      font-family: Arial, Helvetica, 'DejaVu Sans', sans-serif;
      font-size: 12px;
      fill: rgb(102, 102, 102);
    }
  </style>

  <!-- Border and background -->
  <rect x="1" y="1"
      width="${params.width - 2}" height="${params.height - 2}"
      rx="2" ry="2"
      stroke="rgb(203, 56, 55)"
      stroke-width="2"
      fill="rgb(244, 244, 242)"
  />

  <!-- NPM logo -->${logoSection}

  <!-- Install command -->${installSection}
${contentSection}

</svg>`
}

export function renderIndex (head = '') {
  return `<!DOCTYPE HTML>
<html lang="en-us">
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <title>NodeICO - Classy Node.js Badges</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Generate beautiful NPM package badges for your projects. Simple, clean, and customizable badges for Node.js packages.">
    <link rel="stylesheet" href="/style.css" type="text/css">
  </head>
  <body>

    <div class="container">
      <header class="hero">
        <h1>NodeICO</h1>
        <p class="tagline">Beautiful badges for your Node.js packages</p>
      </header>

      <main class="content">
        <section class="examples-section">
          <div class="example-grid">
            <div class="example-item">
              <div class="badge-preview">
                <img src="/npm/express.svg" alt="Express standard badge" loading="lazy">
              </div>
              <code class="url-display">nodei.co/npm/express.svg</code>
            </div>

            <div class="example-item">
              <div class="badge-preview">
                <img src="/npm/react.svg?stars=true&downloads=true" alt="React badge with stars and downloads" loading="lazy">
              </div>
              <code class="url-display">nodei.co/npm/react.svg?stars=true&downloads=true</code>
            </div>

            <div class="example-item">
              <div class="badge-preview">
                <img src="/npm/typescript.svg?compact=true" alt="TypeScript compact badge" loading="lazy">
              </div>
              <code class="url-display">nodei.co/npm/typescript.svg?compact=true</code>
            </div>

            <div class="example-item">
              <div class="badge-preview">
                <img src="/npm/@fastify/static.svg?mini=true" alt="Scoped package mini badge" loading="lazy">
              </div>
              <code class="url-display">nodei.co/npm/@fastify/static.svg?mini=true</code>
            </div>
          </div>
        </section>

        <section class="generator-section">
          <h2>Try it yourself</h2>
          <div class="generator-form">
            <input
              name="packageName"
              type="text"
              placeholder="Enter package name..."
              class="package-input"
              autocomplete="off"
              spellcheck="false"
            >

            <div class="badge-options">
              <label class="option-label">
                <input type="radio" name="style" value="standard" checked>
                <span>Standard</span>
              </label>
              <label class="option-label">
                <input type="radio" name="style" value="compact">
                <span>Compact</span>
              </label>
              <label class="option-label">
                <input type="radio" name="style" value="mini">
                <span>Mini</span>
              </label>
              <div class="separator"></div>
              <label class="option-label standard-only">
                <input type="checkbox" name="stars" value="true">
                <span>Stars</span>
              </label>
              <label class="option-label standard-only">
                <input type="checkbox" name="downloads" value="true">
                <span>Downloads</span>
              </label>
            </div>

            <div class="status-messages">
              <div class="package-not-found" style="display: none;">
                <p>Package not found: <span class="package-name"></span></p>
              </div>

              <div class="package-not-valid" style="display: none;">
                <p>Invalid package name: <span class="package-name"></span></p>
              </div>
            </div>

            <div class="generated-badges" style="display: none;">
              <!-- Badges will be dynamically generated here -->
            </div>
          </div>
        </section>

        <section class="usage-section">
          <h2>How to use</h2>

          <div class="code-examples">
            <div class="code-block">
              <h3>HTML</h3>
              <pre><code>&lt;a href="https://nodei.co/npm/package-name"&gt;&lt;img src="https://nodei.co/npm/package-name.svg"&gt;&lt;/a&gt;</code></pre>
            </div>

            <div class="code-block">
              <h3>Markdown</h3>
              <pre><code>[![NPM](https://nodei.co/npm/package-name.svg)](https://nodei.co/npm/package-name)</code></pre>
            </div>
          </div>
        </section>

        <section class="options-section">
          <h2>Customization options</h2>

          <div class="options-grid">
            <div class="option-card">
              <h3>Compact Style</h3>
              <p>Clean and minimal design for space-conscious layouts</p>
              <div class="option-example">
                <img src="/npm/express.svg?compact=true" alt="Compact style example" loading="lazy">
              </div>
              <code>?compact=true</code>
            </div>

            <div class="option-card">
              <h3>Mini Style</h3>
              <p>Ultra-compact version for tight spaces</p>
              <div class="option-example">
                <img src="/npm/vue.svg?mini=true" alt="Mini style example" loading="lazy">
              </div>
              <code>?mini=true</code>
            </div>

            <div class="option-card">
              <h3>Star Counts</h3>
              <p>Show GitHub star count on your badge</p>
              <div class="option-example">
                <img src="/npm/vite.svg?stars=true" alt="Stars example" loading="lazy">
              </div>
              <code>?stars=true</code>
            </div>

            <div class="option-card">
              <h3>Download Stats</h3>
              <p>Display weekly download count</p>
              <div class="option-example">
                <img src="/npm/webpack.svg?downloads=true" alt="Downloads example" loading="lazy">
              </div>
              <code>?downloads=true</code>
            </div>
          </div>
        </section>
      </main>

      <footer class="footer">
        <p>
          <strong>Legal Notice:</strong> npm is a trademark of GitHub, Inc. (a subsidiary of Microsoft Corporation).
          NodeICO is an independent service that is not affiliated with, endorsed by, or sponsored by GitHub, Microsoft,
          npm, Inc., or any of their subsidiaries or affiliates. This service generates badges using publicly available
          data from the npm registry. All package information, names, and statistics are the property of their respective owners.
        </p>
        <p>
          <a href="https://github.com/rvagg/nodei.co" style="color: inherit; opacity: 0.7;">Contribute on GitHub</a>
        </p>
      </footer>
    </div>

    <script type="text/javascript" src="/js/script.js"></script>
  </body>
</html>`
}

export function renderUser (user, packages, head = '') {
  const packageList = packages.map(pkg => `
    <div class="package-item">
      <h3><a href="/npm/${escapeHtml(pkg.name)}/">${escapeHtml(pkg.name)}</a></h3>
      <p class="package-description">${escapeHtml(pkg.description || 'No description')}</p>
      <div class="badge-preview">
        <img src="/npm/${escapeHtml(pkg.name)}.svg" alt="${escapeHtml(pkg.name)} badge">
      </div>
    </div>
  `).join('')

  return `<!DOCTYPE HTML>
<html lang="en-us">
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <title>NodeICO - Packages by ${escapeHtml(user)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="NPM packages by ${escapeHtml(user)}">
    <link rel="stylesheet" href="/style.css" type="text/css">
  </head>
  <body>
    <div class="container">
      <header class="hero">
        <h1><a href="/" style="color: inherit; text-decoration: none;">NodeICO</a></h1>
        <p class="tagline">Beautiful badges for your Node.js packages</p>
      </header>

      <main class="content">
        <section class="user-packages">
          <h2>Packages by ${escapeHtml(user)}</h2>
          <div class="packages-grid">
            ${packageList}
          </div>
        </section>
      </main>

      <footer class="footer">
        <p>
          <strong>Legal Notice:</strong> npm is a trademark of GitHub, Inc. (a subsidiary of Microsoft Corporation).
          NodeICO is an independent service that is not affiliated with, endorsed by, or sponsored by GitHub, Microsoft,
          npm, Inc., or any of their subsidiaries or affiliates. This service generates badges using publicly available
          data from the npm registry. All package information, names, and statistics are the property of their respective owners.
        </p>
      </footer>
    </div>
  </body>
</html>`
}
