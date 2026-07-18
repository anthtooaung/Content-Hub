# Auth & Trust

## Design Decisions

**Split layout won over centered card and magic link.** The left illustration panel communicates value during signup ("Create content that converts") while the right side has the form. This builds trust by showing what the user gets before they commit. Centered card felt generic; magic link felt too unconventional for a hackathon.

**Social login buttons above email.** Google and GitHub buttons are prominent, positioned above the email form. This reduces friction — most users prefer social login. "Or continue with email" divider makes the fallback clear.

**Password strength indicator.** Three-bar visual indicator (weak/medium/strong) updates on input. Provides immediate feedback without being annoying.

**Remember me + Forgot password.** Standard auth UX patterns that build trust. Remember me checkbox is checked by default.

## CSS Patterns

```css
/* Split layout */
.auth-split { display: flex; min-height: calc(100vh - 52px); width: 100%; }
.auth-illustration {
  flex: 1; background: linear-gradient(135deg, var(--color-primary) 0%, #1E40AF 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px; color: white; position: relative; overflow: hidden;
}
.auth-form-side {
  flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px;
}

/* Social buttons */
.social-buttons { display: flex; gap: 10px; margin-bottom: 20px; }
.btn-social {
  flex: 1; padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-control);
  background: var(--color-surface); cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 8px; font-size: 13px; font-weight: 500; color: var(--color-text);
  transition: all var(--transition-fast);
}
.btn-social:hover { background: var(--color-surface-subtle); border-color: var(--color-border-strong); }

/* Password strength */
.password-strength { display: flex; gap: 4px; margin-top: 6px; }
.strength-bar { height: 3px; flex: 1; border-radius: 2px; background: var(--color-border); }
.strength-bar.weak { background: var(--color-error); }
.strength-bar.medium { background: var(--color-warning); }
.strength-bar.strong { background: var(--color-success); }

/* Divider */
.divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
.divider span { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; }
```

## HTML Structures

```html
<div class="auth-split">
  <div class="auth-illustration">
    <h2>Create content that converts</h2>
    <p>AI-powered social media posts for your business.</p>
    <div class="auth-mockup"><!-- UI mockup --></div>
  </div>
  <div class="auth-form-side">
    <div class="auth-form-container">
      <div class="auth-logo"><!-- logo + "Content Hub" --></div>
      <div class="auth-title">Welcome back</div>
      <div class="auth-subtitle">Sign in to continue generating content</div>
      <div class="social-buttons"><!-- Google, GitHub --></div>
      <div class="divider"><span>or continue with email</span></div>
      <form><!-- email, password, remember me, submit --></form>
      <div class="auth-footer">Don't have an account? <a>Create one</a></div>
    </div>
  </div>
</div>
```

## What to Avoid
- Centered card auth — too generic, doesn't communicate value
- Magic link only — unconventional, may confuse hackathon judges
- Password hidden by default with no strength feedback

## Origin
Synthesized from sketches: 007
Source files available in: sources/007-auth-screens/
