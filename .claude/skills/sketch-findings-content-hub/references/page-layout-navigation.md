# Page Layout & Navigation

## Design Decisions

### Hero Layout: Product-First (Winner)
- **Chosen:** Real UI mockup front and center with how-it-works flow below
- **Rejected:** Centered hero (too generic, felt like every SaaS landing page), Split layout (too preview-oriented, didn't communicate the product)
- **Why it won:** Shows the actual product immediately — users understand what they're getting in 3 seconds. The how-it-works section reinforces the simple 3-step flow. Social proof testimonials add credibility without being pushy.
- **Key visual properties:**
  - Two-column hero: 1.1fr text + 0.9fr mockup, centered vertically
  - Subtle perspective transform on mockup: `transform: perspective(800px) rotateY(-2deg)`
  - How-it-works: 3-column grid with numbered step circles (48px, primary-soft bg, primary text)
  - Testimonials: 3-column grid, italic text, left-aligned

### Dashboard Layout: Timeline (Winner)
- **Chosen:** Date-branching timeline with full campaign summaries
- **Rejected:** Grid cards (too scattered, hard to find specific campaigns), List rows (too data-dense, not engaging for small-business users)
- **Why it won:** Groups content by time, making it natural to find "that campaign from last week." Each card gets full width for preview text, platform badges, and action buttons. The timeline spine (2px border line with primary-colored dots) provides visual structure.
- **Key visual properties:**
  - Timeline: `padding-left: 40px`, `::before` pseudo-element for vertical spine
  - Date dots: 12px circle, primary bg, surface border
  - Cards: Full-width `history-card` inside timeline groups
  - Empty state: 80px icon, encouraging message, primary CTA

### Page Container
- Max-width: 1200px (landing), 1440px (app pages)
- Horizontal padding: 32px desktop, 16px mobile
- Media query breakpoint: 768px

### Site Header
- Flex layout: logo left, nav + CTA right
- Logo: 32px primary square icon + bold 18px text
- Nav links: 14px, 500 weight, text-secondary, hover → primary
- Active nav: primary-soft bg + primary text + control radius
- CTA button: primary bg, 14px 600 weight, control radius

### Footer
- Border-top, centered text, text-muted, 14px

## CSS Patterns

```css
/* Page container */
.page-container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
@media (max-width: 768px) { .page-container { padding: 0 16px; } }

/* Site header */
.site-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0; border-bottom: 1px solid var(--color-border);
}
.logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; }
.logo-icon { width: 32px; height: 32px; background: var(--color-primary); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; }

/* Timeline */
.timeline { position: relative; padding-left: 40px; }
.timeline::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0;
  width: 2px; background: var(--color-border); }
.timeline-date::before { content: ''; position: absolute; left: -33px; top: 4px;
  width: 12px; height: 12px; border-radius: 50%; background: var(--color-primary);
  border: 2px solid var(--color-surface); }

/* Empty state */
.empty-state { text-align: center; padding: 80px 24px; }
.empty-icon { width: 80px; height: 80px; border-radius: var(--radius-panel);
  background: var(--color-surface-subtle); display: flex; align-items: center;
  justify-content: center; margin: 0 auto 24px; font-size: 36px; }
```

## HTML Structures

```html
<!-- Site header -->
<header class="site-header">
  <div class="logo"><div class="logo-icon">✦</div>Content Hub</div>
  <div style="display:flex;align-items:center;gap:24px;">
    <div class="nav-links">
      <a href="#how">How it works</a>
      <a href="#proof">What people say</a>
    </div>
    <button class="nav-cta">Sign in</button>
  </div>
</header>

<!-- Timeline -->
<div class="timeline">
  <div class="timeline-group">
    <div class="timeline-date">2 days ago</div>
    <div class="timeline-cards">
      <div class="history-card"><!-- card content --></div>
    </div>
  </div>
</div>
```

## What to Avoid
- Centered hero without product preview — feels generic and doesn't communicate the product
- Split layout with text-heavy left side — too much copy before users understand the product
- Grid cards for history — too scattered, platform badges too small, hard to scan
- List/table rows for history — too data-dense for small-business users who aren't power users
- Heavy gradients, glassmorphism, or chatbot-style UI —违背 the calm, professional aesthetic

## Origin
Synthesized from sketches: 001, 003
Source files available in: sources/001-landing-page/, sources/003-dashboard-history/
