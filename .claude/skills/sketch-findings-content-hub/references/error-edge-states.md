# Error & Edge States

## Design Decisions

**Full-page errors won over inline banners for critical states.** Dedicated error pages (404, server error, auth expired) feel calmer and more trustworthy than inline banners for serious issues. Inline banners are still used for non-critical warnings (rate limits, partial failures).

**Calm, helpful tone.** Error messages explain what happened and what to do next. "The AI service timed out. This usually resolves on its own — try again in a moment." Not "ERROR: TimeoutException."

**Error ID for support.** Server errors show an error ID (e.g., `err_7f3a2b1c`) and timestamp. This helps with debugging and support without exposing internals.

**Retry is always prominent.** Every error state has a clear "Try Again" button as the primary action. Secondary actions (Check Status, Use Backup Provider) are available but less prominent.

**Rate limit as progress bar.** Rate limits show a visual bar (green → yellow → red) with "8 / 10 generations used · Resets in 42 min". Informative, not punishing.

**Partial failure communication.** When some platforms succeed and others fail, show a clear breakdown: "TikTok ✓ Instagram ✓ Facebook ✗" with a "Regenerate Facebook" button.

## CSS Patterns

```css
/* Error banner */
.error-banner {
  border-radius: var(--radius-card); padding: 20px; margin-bottom: 20px;
  display: flex; gap: 14px; align-items: flex-start;
}
.error-banner.error { background: var(--color-error-soft); border: 1px solid #fecaca; }
.error-banner.warning { background: var(--color-warning-soft); border: 1px solid var(--color-warning-border); }
.error-banner.info { background: var(--color-info-soft); border: 1px solid #bae6fd; }

/* Error icon */
.error-icon {
  width: 36px; height: 36px; border-radius: 9999px; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.error-icon.error { background: var(--color-error); color: white; }
.error-icon.warning { background: var(--color-warning); color: white; }
.error-icon.info { background: var(--color-info); color: white; }

/* Empty state */
.empty-state {
  text-align: center; padding: 60px 24px; background: var(--color-surface);
  border: 1px solid var(--color-border); border-radius: var(--radius-card);
}
.empty-title { font-size: 18px; font-weight: 600; color: var(--color-text); margin-bottom: 8px; }
.empty-message { font-size: 14px; color: var(--color-text-muted); max-width: 360px; margin: 0 auto 20px; line-height: 1.6; }

/* Rate limit bar */
.rate-limit-bar { height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden; margin: 12px 0; }
.rate-limit-fill { height: 100%; border-radius: 3px; }
.rate-limit-fill.ok { background: var(--color-success); }
.rate-limit-fill.warn { background: var(--color-warning); }
.rate-limit-fill.danger { background: var(--color-error); }
```

## HTML Structures

```html
<!-- Full-page error -->
<div class="empty-state">
  <div class="empty-icon">
    <svg width="56" height="56"><!-- error icon --></svg>
  </div>
  <div class="empty-title">Something went wrong</div>
  <div class="empty-message">Our servers hit an unexpected error. The team has been notified.</div>
  <div style="display:flex;gap:8px;justify-content:center;">
    <button class="btn-primary">Try Again</button>
    <button class="btn-secondary">Check Status</button>
  </div>
  <div style="margin-top:16px;padding:12px;background:var(--color-surface-subtle);border-radius:8px;font-family:monospace;font-size:12px;color:var(--color-text-muted);">
    Error ID: err_7f3a2b1c · 2026-07-18T14:32:00Z
  </div>
</div>

<!-- Inline warning -->
<div class="error-banner warning">
  <div class="error-icon warning"><!-- warning icon --></div>
  <div class="error-content">
    <div class="error-title warning">Partial failure</div>
    <div class="error-message">TikTok and Instagram generated successfully. Facebook failed.</div>
  </div>
</div>
```

## What to Avoid
- Hostile error messages ("You broke it!") — stay calm and helpful
- Hidden retry actions — always make "Try Again" prominent
- Generic "Something went wrong" without next steps
- Exposing stack traces or internal error details to users

## Origin
Synthesized from sketches: 009
Source files available in: sources/009-error-edge-states/
