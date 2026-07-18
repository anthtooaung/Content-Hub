# App Shell & Navigation

## Design Decisions

**Sidebar navigation won over top-nav and slide-out.** A left sidebar with icon+label items provides clear section grouping (Create / Library), stays visible while scrolling, and scales naturally if more pages are added. Top nav felt too flat for a 2-page app; slide-out added unnecessary friction.

**Bottom tab navigation for mobile.** At 375px, the sidebar collapses to a bottom tab bar with 3 items (Generate, Dashboard, Settings). Thumb-reachable, familiar mobile pattern.

**Section grouping in sidebar.** Items grouped by purpose: "Create" (Generate) and "Library" (Dashboard, Favorites). Settings pinned to bottom. This creates visual hierarchy without extra chrome.

## CSS Patterns

```css
/* Sidebar layout */
.sidebar-layout { display: flex; min-height: calc(100vh - 52px); }
.app-sidebar {
  width: 240px; background: var(--color-surface); border-right: 1px solid var(--color-border);
  padding: var(--space-6) var(--space-4); position: sticky; top: 108px; height: calc(100vh - 108px);
  display: flex; flex-direction: column; gap: var(--space-1);
}
.sidebar-main { flex: 1; padding: var(--space-8) var(--space-6); max-width: 960px; }

/* Sidebar item */
.sidebar-item {
  display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-control); font-size: var(--text-small); font-weight: 500;
  color: var(--color-text-secondary); cursor: pointer; transition: all var(--transition-fast);
  border: none; background: none; width: 100%; text-align: left;
}
.sidebar-item:hover { background: var(--color-surface-subtle); color: var(--color-text); }
.sidebar-item.active { background: var(--color-primary-soft); color: var(--color-primary); }

/* Section label */
.sidebar-section {
  font-size: var(--text-caption); font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  padding: var(--space-4) var(--space-4) var(--space-2);
}

/* Bottom nav (mobile) */
.bottom-nav {
  position: absolute; bottom: 0; left: 0; right: 0; background: var(--color-surface);
  border-top: 1px solid var(--color-border); display: flex; justify-content: space-around;
  padding: 8px 0 20px; z-index: 10;
}
```

## HTML Structures

```html
<!-- Sidebar -->
<div class="sidebar-layout">
  <aside class="app-sidebar">
    <div class="sidebar-section">Create</div>
    <button class="sidebar-item active">Generate</button>
    <div class="sidebar-section">Library</div>
    <button class="sidebar-item">Dashboard</button>
    <button class="sidebar-item">Favorites</button>
    <div class="sidebar-spacer"></div>
    <button class="sidebar-item">Settings</button>
  </aside>
  <main class="sidebar-main"><!-- page content --></main>
</div>
```

## What to Avoid
- Top nav underline — too flat, doesn't communicate hierarchy
- Hamburger/slide-out — adds tap friction for a simple 2-page app
- Icon-only sidebar — labels improve scanability for new users

## Origin
Synthesized from sketches: 005, 006
Source files available in: sources/005-app-shell-navigation/, sources/006-mobile-responsive/
