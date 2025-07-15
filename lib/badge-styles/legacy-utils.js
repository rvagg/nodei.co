// Shared utilities for legacy badge styles (standard, compact, mini)
import { createStyle } from '../badge-builder.js'

// Common font family for legacy styles
export const LEGACY_FONT_FAMILY = "'Courier New', Courier, 'DejaVu Sans Mono', 'Liberation Mono', Monaco, monospace"

// Create common style definitions for legacy badges
export function createLegacyStyles () {
  return createStyle(`    .main-text {
      font-family: ${LEGACY_FONT_FAMILY};
      font-size: 11px;
      fill: rgb(102, 102, 102);
    }
    .install-text {
      font-family: ${LEGACY_FONT_FAMILY};
      font-size: 12px;
      font-weight: bold;
      fill: rgb(102, 102, 102);
    }
    .star-icon {
      font-family: Arial, Helvetica, 'DejaVu Sans', sans-serif;
      font-size: 12px;
      fill: rgb(102, 102, 102);
    }`)
}

// Create minimal style definitions (for mini badges)
export function createMinimalStyles () {
  return createStyle(`    .install-text {
      font-family: ${LEGACY_FONT_FAMILY};
      font-size: 12px;
      font-weight: bold;
      fill: rgb(102, 102, 102);
    }`)
}

// Humanize numbers for legacy badges (same as formatNumber but different implementation)
export function humanizeNumber (num) {
  if (typeof num !== 'number') return String(num)
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num)
}