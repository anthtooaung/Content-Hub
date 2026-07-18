# Loading & State Transitions

## Design Decisions

### Loading Pattern: Progress Overlay (Winner)
- **Chosen:** Centered progress bar with status messages overlaying results area
- **Rejected:** Inline skeleton cards (too subtle — users might not notice the loading), Progressive reveal (too theatrical — felt like a magic trick rather than a tool)
- **Why it won:** The overlay clearly communicates "something is happening" with a centered spinner, status text, and progress bar. The backdrop (85% opacity surface) dims the skeleton cards behind it, creating focus. Progress bar fills incrementally with each status message.
- **Key visual properties:**
  - Overlay backdrop: `position: absolute; inset: 0; background: rgba(248,250,252,0.85); border-radius: var(--radius-panel)`
  - Spinner: 36px, 3px border (border-top colored primary), 0.8s rotation
  - Status text: 14px, text-secondary
  - Progress bar: 200px wide, 6px height, border-radius 3px
  - Track: border color bg; Fill: primary color, `transition: width 0.3s ease`
  - Fade in/out: `opacity: 0 → 1` with `transition: opacity 0.2s`

### Skeleton Pattern (for reference)
- Used behind the overlay as placeholder content
- `.skeleton`: border color bg, 6px radius, `animation: pulse 1.4s ease-in-out infinite`
- Lines: 12px height, varying widths (40%, 60%, 80%)
- Block: 60px height, radius-panel
- Speed controlled via CSS custom property: `--skel-speed`

### State Transitions
- **Empty → Loading:** Show overlay with fade-in, start progress bar
- **Loading → Loaded:** Fade out overlay, cards fade in with `translateY(8px) → 0` and `opacity: 0 → 1`
- **Loading → Error:** Fade out overlay, show error cards (warning border + warning-soft bg)
- **Error → Retry:** Re-trigger loading overlay for failed platform only

### Error Handling
- Individual platform failure: error card with warning styling, retry button
- Partial success: show successful results + error card for failed platform
- Error card: `border-color: var(--color-warning-border); background: var(--color-warning-soft)`
- Retry button: warning border + text, surface bg

### Controls Bar (for testing states)
- Horizontal bar with state buttons: Empty / Loading / Loaded / Error
- Speed slider: 500ms–3000ms range, controls skeleton pulse and status message duration
- Active state: primary-soft bg, primary-border, primary text
- Danger state: error border + text, error-soft bg on hover

## CSS Patterns

```css
/* Progress overlay */
.progress-overlay { position: relative; }
.progress-backdrop {
  position: absolute; inset: 0; background: rgba(248,250,252,0.85);
  border-radius: var(--radius-panel);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 10;
}
.progress-backdrop.show { opacity: 1; pointer-events: all; }
.progress-bar-track { width: 200px; height: 6px; background: var(--color-border);
  border-radius: 3px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: var(--color-primary);
  border-radius: 3px; width: 0%; transition: width 0.3s ease; }

/* Skeleton */
.skeleton { background: var(--color-border); border-radius: 6px;
  animation: pulse var(--skel-speed, 1.4s) ease-in-out infinite; }
.skeleton-line { height: 12px; margin-bottom: 8px; }
.skeleton-line.w60 { width: 60%; }
.skeleton-line.w80 { width: 80%; }
.skeleton-block { height: 60px; border-radius: var(--radius-panel); margin-bottom: 12px; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Result card entrance animation */
.result-card {
  opacity: 0; transform: translateY(8px);
  transition: all var(--transition-fast);
}
.result-card.visible { opacity: 1; transform: translateY(0); }

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }

/* Error card */
.result-card.error { border-color: var(--color-warning-border); background: var(--color-warning-soft); }
.error-msg { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-warning); }
.retry-btn { padding: 6px 12px; border-radius: var(--radius-control);
  border: 1px solid var(--color-warning); background: var(--color-surface);
  color: var(--color-warning); font-size: 13px; font-weight: 500; cursor: pointer; }
```

## HTML Structures

```html
<!-- Progress overlay wrapping results -->
<div class="progress-overlay" style="position:relative;">
  <div class="progress-backdrop" id="overlay">
    <div style="width:36px;height:36px;border:3px solid var(--color-border);
      border-top-color:var(--color-primary);border-radius:50%;
      animation:spin 0.8s linear infinite;"></div>
    <div id="overlay-status" style="font-size:14px;color:var(--color-text-secondary);">
      Understanding your campaign...
    </div>
    <div class="progress-bar-track">
      <div class="progress-bar-fill" id="progress-fill"></div>
    </div>
  </div>
  <div id="results-content"><!-- cards appear here --></div>
</div>

<!-- Skeleton card (behind overlay) -->
<div class="skel-card">
  <div class="skeleton skeleton-block" style="height:20px;width:30%;margin-bottom:12px;border-radius:4px;"></div>
  <div class="skeleton skeleton-line w80"></div>
  <div class="skeleton skeleton-line w60"></div>
  <div class="skeleton skeleton-line" style="width:40%;"></div>
</div>

<!-- Error card -->
<div class="result-card error">
  <div class="error-msg">⚠️ Could not generate Facebook post. TikTok and Instagram succeeded.</div>
  <div class="result-content" style="color:var(--color-text-muted);font-style:italic;">
    Facebook generation timed out. Please try again.
  </div>
  <div class="result-actions"><button class="retry-btn">↻ Retry</button></div>
</div>
```

## What to Avoid
- Skeleton-only loading without overlay — too subtle, users may think nothing is happening
- Progressive reveal (one card at a time) — feels theatrical, adds perceived latency
- No loading feedback at all — users stare at an empty page
- Single error for all platforms — if one fails, show per-platform error cards
- Infinite spinner without progress bar — users don't know how long to wait
- Aggressive error messaging — keep it calm, use warning colors not error red for partial failures

## Origin
Synthesized from sketches: 004
Source files available in: sources/004-loading-transitions/
