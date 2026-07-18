# Post-Generation UX

## Design Decisions

**Tabbed by platform won over card actions and accordion.** Tabs let users focus on one platform at a time while keeping all platforms one click away. Copy is the primary action on each tab. Card actions had too many buttons per card; accordion hid content behind clicks.

**Copy is the primary action.** Every platform result has a prominent "Copy Post" button. Hashtags and caption have separate copy buttons. This matches the core user flow: generate → copy → paste into social platform.

**Edit modal with character count.** Clicking Edit opens a modal with the post text in a textarea. Character count updates in real-time (with /280 for Twitter). This lets users tweak without leaving the results view.

**Success banner confirmation.** After generation, a green banner appears: "3 platform posts generated successfully" with a dismiss button. Provides clear feedback without being intrusive.

**Regenerate per platform.** Each tab has a "Regenerate" button to re-generate just that platform's content. Useful when one platform's output isn't right but others are fine.

## CSS Patterns

```css
/* Platform tabs */
.platform-tabs { display: flex; gap: 4px; margin-bottom: 16px; }
.platform-tab {
  padding: 8px 16px; border-radius: var(--radius-pill); border: 1px solid var(--color-border);
  font-size: 13px; font-weight: 500; cursor: pointer; background: var(--color-surface);
  transition: all var(--transition-fast); display: flex; align-items: center; gap: 6px;
}
.platform-tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

/* Action buttons */
.action-bar { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.action-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;
  border: 1px solid var(--color-border); border-radius: var(--radius-control);
  font-size: 12px; font-weight: 500; cursor: pointer; background: var(--color-surface);
  transition: all var(--transition-fast); color: var(--color-text-secondary);
}
.action-btn.primary { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.action-btn.copied { background: var(--color-success-soft); color: var(--color-success); border-color: var(--color-success); }

/* Edit modal */
.edit-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4);
  z-index: 200; display: none; align-items: center; justify-content: center;
}
.edit-overlay.open { display: flex; }
.edit-modal {
  background: var(--color-surface); border-radius: var(--radius-modal); width: 100%; max-width: 600px;
  box-shadow: var(--shadow-modal);
}

/* Success banner */
.success-banner {
  background: var(--color-success-soft); border: 1px solid #bbf7d0; border-radius: var(--radius-card);
  padding: 16px 20px; display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
}
```

## HTML Structures

```html
<!-- Platform tabs -->
<div class="platform-tabs">
  <button class="platform-tab active">
    <span class="tab-dot" style="background:var(--color-tiktok);"></span> TikTok
  </button>
  <button class="platform-tab">
    <span class="tab-dot" style="background:var(--color-instagram);"></span> Instagram
  </button>
  <button class="platform-tab">
    <span class="tab-dot" style="background:var(--color-facebook);"></span> Facebook
  </button>
</div>

<!-- Result card with actions -->
<div class="result-card">
  <div class="result-post"><!-- generated post text --></div>
  <div class="result-hashtags"><!-- hashtags --></div>
  <div class="result-cta-badge">Shop Now →</div>
  <div class="action-bar">
    <button class="action-btn primary">📋 Copy Post</button>
    <button class="action-btn">🏷️ Copy Hashtags</button>
    <button class="action-btn">✏️ Edit</button>
    <button class="action-btn">♡ Save</button>
    <button class="action-btn">🔄 Regenerate</button>
  </div>
</div>
```

## What to Avoid
- Card actions with too many buttons per card — overwhelming
- Accordion — hides content, adds click friction
- Auto-copy-all without user control — surprises users

## Origin
Synthesized from sketches: 008
Source files available in: sources/008-post-generation/
