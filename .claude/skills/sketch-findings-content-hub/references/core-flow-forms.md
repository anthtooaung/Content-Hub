# Core Flow & Forms

## Design Decisions

### Generate Flow: Wizard (Winner)
- **Chosen:** Step-by-step wizard: form → loading → results
- **Rejected:** Side-by-side (too dense on desktop, broke on mobile), Tabbed results (not linear enough, users had to understand tabs)
- **Why it won:** Most natural for first-time users. One clear action at a time. The wizard progress bar (step numbers + connectors) provides orientation. The loading state with status messages keeps users informed. Results appear full-width, one platform at a time.
- **Key visual properties:**
  - Wizard progress: flex row, step circles (28px), connectors (flex:1, 2px height)
  - Active step: primary border + primary-soft bg + primary text
  - Done step: success border + success-soft bg + success text
  - Form panel: surface bg, border, radius-panel, shadow-card
  - Max-width: 720px centered for wizard flow

### Form Controls
- Labels: 14px, 600 weight, 8px margin-bottom
- Inputs: 100% width, min-height 44px, radius-control, border-strong
- Focus: primary border + shadow-focus ring
- Textarea: min-height 120px, resize: vertical
- Helper text: 14px, text-muted, 4px margin-top
- Two-column grid for related selects: `grid-template-columns: 1fr 1fr; gap: 16px`

### Generate Button
- Full-width, min-height 48px, radius-control
- Primary bg, white text, 16px 600 weight
- Hover: primary-hover, translateY(-1px)
- Active: primary-active, translateY(0)
- Loading state: spinner (20px, white border with transparent top) + hide label
- Disabled: surface-subtle bg, text-disabled, no pointer

### Result Cards
- Surface bg, border, radius-panel, 16px padding, 16px margin-bottom
- Header: flex, platform badge (28px square, rounded, platform color) + name + action buttons
- Content: 14px, line-height 1.6
- Hashtags: 13px, primary color
- CTA: 13px, 600 weight, text-secondary
- Actions: Copy button (border, surface bg, hover → primary-soft + primary text)
- Error state: warning border + warning-soft bg + retry button

### Platform Tabs (for tabbed variant)
- Flex row, 8px gap
- Tab: 8px 16px padding, control radius, border, surface bg
- Active tab: primary-soft bg, primary-border, primary text
- Platform dot: 8px circle, platform color

## CSS Patterns

```css
/* Form panel */
.form-panel {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-panel); padding: 24px; box-shadow: var(--shadow-card);
}
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.form-group input, .form-group textarea, .form-group select {
  width: 100%; min-height: 44px; border-radius: var(--radius-control);
  border: 1px solid var(--color-border-strong); background: var(--color-surface);
  padding: 10px 12px; font-size: var(--text-body); font-family: var(--font-sans);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  border-color: var(--color-focus); outline: none; box-shadow: var(--shadow-focus);
}

/* Generate button */
.generate-btn {
  width: 100%; min-height: 48px; border-radius: var(--radius-control);
  background: var(--color-primary); color: white; border: none;
  font-size: 16px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all var(--transition-fast);
}
.generate-btn:hover { background: var(--color-primary-hover); }
.generate-btn.loading { opacity: 0.7; pointer-events: none; }
.generate-btn .spinner { display: none; width: 20px; height: 20px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
  border-radius: 50%; animation: spin 0.6s linear infinite; }
.generate-btn.loading .spinner { display: block; }
.generate-btn.loading .btn-label { display: none; }

/* Wizard progress */
.wizard-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.wizard-step { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-text-muted); }
.wizard-step.active { color: var(--color-primary); font-weight: 600; }
.wizard-step.done { color: var(--color-success); }
.wizard-num { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--color-border);
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
.wizard-step.active .wizard-num { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); }
.wizard-step.done .wizard-num { border-color: var(--color-success); background: var(--color-success-soft); color: var(--color-success); }
.wizard-connector { flex: 1; height: 2px; background: var(--color-border); }
.wizard-connector.done { background: var(--color-success); }

/* Result card */
.result-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-panel); padding: 16px; margin-bottom: 16px;
  transition: all var(--transition-fast);
}
.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.platform-badge { width: 28px; height: 28px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 11px; font-weight: 700; }
.platform-badge.tt { background: var(--color-tiktok); }
.platform-badge.ig { background: var(--color-instagram); }
.platform-badge.fb { background: var(--color-facebook); }

/* Error card */
.result-card.error { border-color: var(--color-warning-border); background: var(--color-warning-soft); }
.error-msg { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-warning); }
.retry-btn { padding: 6px 12px; border-radius: var(--radius-control);
  border: 1px solid var(--color-warning); background: var(--color-surface);
  color: var(--color-warning); font-size: 13px; font-weight: 500; cursor: pointer; }
```

## HTML Structures

```html
<!-- Wizard flow -->
<div class="wizard-progress">
  <div class="wizard-step active" id="ws1"><div class="wizard-num">1</div>Campaign details</div>
  <div class="wizard-connector" id="wc1"></div>
  <div class="wizard-step" id="ws2"><div class="wizard-num">2</div>Generating</div>
  <div class="wizard-connector" id="wc2"></div>
  <div class="wizard-step" id="ws3"><div class="wizard-num">3</div>Results</div>
</div>

<!-- Form panel -->
<div class="form-panel">
  <h2>Tell us about your campaign</h2>
  <div class="form-group">
    <label>Business or brand</label>
    <input type="text" placeholder="e.g. Bloom & Brew Coffee">
  </div>
  <div class="form-group">
    <label>What are you promoting?</label>
    <textarea placeholder="Describe your campaign..."></textarea>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
    <div class="form-group"><label>Content goal</label><select>...</select></div>
    <div class="form-group"><label>Tone</label><select>...</select></div>
  </div>
  <button class="generate-btn"><span class="spinner"></span><span class="btn-label">Generate all 3 posts →</span></button>
</div>

<!-- Result card -->
<div class="result-card">
  <div class="result-header">
    <div class="result-platform"><div class="platform-badge tt">TT</div><span class="platform-name">TikTok</span></div>
    <div class="result-actions"><button class="action-btn">📋 Copy</button></div>
  </div>
  <div class="result-content">Post text here...</div>
  <div class="result-hashtags">#hashtag1 #hashtag2</div>
  <div class="result-cta">CTA: Call to action text</div>
</div>
```

## What to Avoid
- Side-by-side form + results — too dense, breaks on mobile, overwhelming for first-time users
- Tabbed results — adds cognitive overhead, users don't know to look for tabs
- Full-width form without wizard progress — users lose sense of where they are in the flow
- Tiny generate buttons — the primary action should be prominent and inviting
- Generic placeholder text — use realistic content (business names, campaign descriptions)

## Origin
Synthesized from sketches: 002
Source files available in: sources/002-generate-form/
