// Template rendering using native JavaScript template strings
import { escapeHtml } from './html-escape.js'
import { getBadgeStyle } from './badge-styles/index.js'

export function renderBadge (ctx) {
  const { options, params, pkginfo } = ctx
  const styleName = options.style || 'standard'
  const style = getBadgeStyle(styleName)

  // For new badge styles that have their own renderer
  if (style && style.render && ['shields', 'flat', 'flat-square'].includes(styleName)) {
    return style.render(pkginfo, options, params)
  }

  // Legacy rendering for standard/compact/mini (will be refactored later)
  // Use the modular badge styles
  if (styleName === 'standard' || styleName === 'compact' || styleName === 'mini') {
    return style.render(pkginfo, options, params)
  }

  // Fallback (shouldn't reach here)
  throw new Error(`Unknown badge style: ${styleName}`)
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
        <p class="hero-description">Display live npm stats in your GitHub README with customizable badges</p>
        <div class="hero-examples">
          <img src="/npm/express.svg?style=shields&data=n,v,d" alt="Express badge example">
          <img src="/npm/typescript.svg?data=s,d" alt="TypeScript badge example">
          <img src="/npm/@babel/core.svg?style=flat&data=n,v" alt="Babel badge example">
          <img src="/npm/js-sha3.svg?style=mini" alt="js-sha3 badge example">
        </div>
      </header>

      <main class="content">
        <section class="generator-section" id="generator">
          <h2>Create Your Badge</h2>
          <p class="section-description">Enter your npm package name and customize your badge</p>
          <div class="generator-form">
            <div class="input-wrapper">
              <input
                name="packageName"
                type="text"
                placeholder="Enter package name (e.g. express, @babel/core)"
                class="package-input"
                autocomplete="off"
                spellcheck="false"
              >
            </div>

            <div class="badge-options">
              <div class="option-group">
                <h3 class="options-heading">Style</h3>
                <div class="style-options">
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
                  <label class="option-label">
                    <input type="radio" name="style" value="shields">
                    <span>Shields</span>
                  </label>
                  <label class="option-label">
                    <input type="radio" name="style" value="flat">
                    <span>Flat</span>
                  </label>
                  <label class="option-label">
                    <input type="radio" name="style" value="flat-square">
                    <span>Flat Square</span>
                  </label>
                </div>
              </div>

              <div class="option-group">
                <h3 class="options-heading">Data</h3>
                <div class="data-options">
                  <label class="option-label data-option">
                    <input type="checkbox" name="data" value="name">
                    <span>Name</span>
                  </label>
                  <label class="option-label data-option">
                    <input type="checkbox" name="data" value="version">
                    <span>Version</span>
                  </label>
                  <label class="option-label data-option">
                    <input type="checkbox" name="data" value="updated">
                    <span>Updated</span>
                  </label>
                  <label class="option-label data-option">
                    <input type="checkbox" name="data" value="downloads">
                    <span>Downloads</span>
                  </label>
                  <label class="option-label data-option">
                    <input type="checkbox" name="data" value="stars">
                    <span>Stars</span>
                  </label>
                </div>
              </div>
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

        <section class="styles-section">
          <h2>Badge Styles</h2>
          <p class="section-description">Choose the style that best fits your project</p>

          <h3 class="style-category">Compact Badges</h3>
          <p class="category-description">Perfect for GitHub READMEs - <a href="https://shields.io" target="_blank" rel="noopener">shields.io</a> inspired, minimal height, maximum information</p>

          <div class="options-grid">
            <div class="option-card">
              <h3>Shields</h3>
              <p>GitHub README compatible, supports multi-data</p>
              <div class="option-example">
                <img src="/npm/express.svg?style=shields&data=version" alt="Shields style" loading="lazy">
                <img src="/npm/express.svg?style=shields&data=n,v,u,d" alt="Multi-data shields" loading="lazy" style="margin-top: 8px;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
                <code class="url-display" style="margin: 0;">?style=shields&data=version</code>
                <code class="url-display" style="margin: 0;">?style=shields&data=n,v,u,d</code>
              </div>
            </div>

            <div class="option-card">
              <h3>Flat</h3>
              <p>Modern design, rounded or square corners</p>
              <div class="option-example">
                <img src="/npm/express.svg?style=flat&data=n,v,d" alt="Flat style" loading="lazy">
                <img src="/npm/express.svg?style=flat-square&data=downloads" alt="Flat square style" loading="lazy" style="margin-top: 8px;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
                <code class="url-display" style="margin: 0;">?style=flat&data=n,v,d</code>
                <code class="url-display" style="margin: 0;">?style=flat-square&data=downloads</code>
              </div>
            </div>

            <div class="option-card">
              <h3>Scoped Packages</h3>
              <p>Great for showing full scoped names</p>
              <div class="option-example">
                <img src="/npm/@fastify/static.svg?style=shields&data=n,v,u" alt="Scoped package shields" loading="lazy">
                <img src="/npm/@babel/core.svg?style=flat&data=n,d" alt="Scoped package flat" loading="lazy" style="margin-top: 8px;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
                <code class="url-display" style="margin: 0;">?style=shields&data=n,v,u</code>
                <code class="url-display" style="margin: 0;">?style=flat&data=n,d</code>
              </div>
            </div>

            <div class="option-card">
              <h3>Single Data Badges</h3>
              <p>Show just one data point per badge</p>
              <div class="option-example">
                <img src="/npm/vite.svg?style=shields&data=version" alt="Version only" loading="lazy">
                <img src="/npm/vite.svg?style=flat&data=downloads" alt="Downloads only" loading="lazy" style="margin-left: 4px;">
                <img src="/npm/vite.svg?style=flat-square&data=updated" alt="Updated only" loading="lazy" style="margin-left: 4px;">
              </div>
              <code class="url-display" style="font-size: 0.75rem;">?style=shields&data=v<br>?style=flat&data=d<br>?style=flat-square&data=u</code>
            </div>
          </div>

          <h3 class="style-category">Detailed Badges</h3>
          <p class="category-description">Classic NodeICO badges with comprehensive package information</p>

          <div class="options-grid">
            <div class="option-card">
              <h3>Standard</h3>
              <p>Classic NodeICO badge with full details</p>
              <div class="option-example">
                <img src="/npm/express.svg" alt="Standard style" loading="lazy">
              </div>
            </div>

            <div class="option-card">
              <h3>Standard with Data</h3>
              <p>Include stars and download counts</p>
              <div class="option-example">
                <img src="/npm/react.svg?data=s,d" alt="With data" loading="lazy">
              </div>
              <code class="url-display">?data=s,d</code>
            </div>

            <div class="option-card">
              <h3>Compact</h3>
              <p>Condensed single-line information</p>
              <div class="option-example">
                <img src="/npm/express.svg?style=compact" alt="Compact style" loading="lazy">
              </div>
              <code class="url-display">?style=compact</code>
            </div>

            <div class="option-card">
              <h3>Mini</h3>
              <p>Minimal badge with install command only</p>
              <div class="option-example">
                <img src="/npm/express.svg?style=mini" alt="Mini style" loading="lazy">
              </div>
              <code class="url-display">?style=mini</code>
            </div>
          </div>
        </section>

        <section class="usage-section">
          <h2>Quick Start</h2>
          <p class="section-description">Add your badge to any README or documentation</p>

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

        <section class="api-section">
          <h2>API Reference</h2>

          <p class="section-description">Complete reference for all badge parameters and options</p>

          <div class="api-content">
            <div class="api-group">
              <h3>Badge Styles</h3>
              <p>Choose your badge style with the <code>style</code> parameter:</p>
              <div class="api-table">
                <table>
                  <tr>
                    <th>Style</th>
                    <th>Description</th>
                    <th>Data Support</th>
                  </tr>
                  <tr>
                    <td><code>standard</code></td>
                    <td>Classic NodeICO badge (default)</td>
                    <td>stars, downloads</td>
                  </tr>
                  <tr>
                    <td><code>compact</code></td>
                    <td>Single-line condensed format</td>
                    <td>none</td>
                  </tr>
                  <tr>
                    <td><code>mini</code></td>
                    <td>Minimal install command only</td>
                    <td>none</td>
                  </tr>
                  <tr>
                    <td><code>shields</code></td>
                    <td>GitHub README compatible</td>
                    <td>all data types</td>
                  </tr>
                  <tr>
                    <td><code>flat</code></td>
                    <td>Modern flat design</td>
                    <td>all data types</td>
                  </tr>
                  <tr>
                    <td><code>flat-square</code></td>
                    <td>Flat design with square corners</td>
                    <td>all data types</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="api-group">
              <h3>Data Parameters</h3>
              <p>Add package information with the <code>data</code> parameter. <strong>Order matters</strong> - data appears in the order specified:</p>
              <div class="api-table">
                <table>
                  <tr>
                    <th>Parameter</th>
                    <th>Alias</th>
                    <th>Description</th>
                    <th>Example Output</th>
                  </tr>
                  <tr>
                    <td><code>name</code></td>
                    <td><code>n</code></td>
                    <td>Package name</td>
                    <td>express</td>
                  </tr>
                  <tr>
                    <td><code>version</code></td>
                    <td><code>v</code></td>
                    <td>Latest version</td>
                    <td>v4.18.2</td>
                  </tr>
                  <tr>
                    <td><code>downloads</code></td>
                    <td><code>d</code></td>
                    <td>Weekly downloads</td>
                    <td>23M dl/w</td>
                  </tr>
                  <tr>
                    <td><code>stars</code></td>
                    <td><code>s</code></td>
                    <td>GitHub stars</td>
                    <td>63k★</td>
                  </tr>
                  <tr>
                    <td><code>updated</code></td>
                    <td><code>u</code></td>
                    <td>Last publish date</td>
                    <td>2mo ago</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="api-group">
              <h3>Usage Examples</h3>
              <div class="api-examples">
                <div class="api-example">
                  <h4>Basic Badge</h4>
                  <code>/npm/express.svg</code>
                  <p>Standard badge with default information</p>
                </div>

                <div class="api-example">
                  <h4>Shields Style with Version</h4>
                  <code>/npm/express.svg?style=shields&data=version</code>
                  <p>Compact GitHub-compatible badge showing version</p>
                </div>

                <div class="api-example">
                  <h4>Multi-Data Badge</h4>
                  <code>/npm/express.svg?style=shields&data=n,v,d</code>
                  <p>Shows name, version, and downloads in that order</p>
                </div>

                <div class="api-example">
                  <h4>Reordered Data</h4>
                  <code>/npm/express.svg?style=flat&data=d,v,u</code>
                  <p>Shows downloads first, then version, then updated date</p>
                </div>

              </div>
            </div>

            <div class="api-group">
              <h3>URL Format</h3>
              <div class="url-format">
                <code>https://nodei.co/npm/&lt;package-name&gt;.svg?&lt;parameters&gt;</code>
              </div>
              <p>
                <strong>Scoped packages:</strong> Include the full scope in the URL: <code>/npm/@babel/core.svg</code><br>
                <strong>Multiple data points:</strong> Separate with commas: <code>data=n,v,d</code><br>
                <strong>Legacy support:</strong> Old parameters like <code>downloads=true</code> still work
              </p>
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

    <script type="text/javascript" src="/badge-generator.js"></script>
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
