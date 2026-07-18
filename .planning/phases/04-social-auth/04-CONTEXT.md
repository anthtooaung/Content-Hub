# Phase 4: Social Auth & User Management — Context

## Goal

Users can sign in with Google or Facebook OAuth and manage their linked platform accounts.

## Why This Phase

OAuth login is the foundation for platform integration. Users need to authenticate with social platforms before they can publish content or access platform-specific features in later phases.

## Requirements

### Must Have

- Google OAuth sign-in (via NextAuth GoogleProvider)
- Facebook OAuth sign-in (via NextAuth FacebookProvider)
- Account linking: user can connect multiple platforms to one account
- Profile page: view linked accounts, unlink platforms
- Session persistence across browser refresh

### Should Have

- Profile photo and display name from OAuth provider
- Account deletion with data cleanup

### Nice to Have

- Instagram/TikTok OAuth (deferred to post-hackathon)

## Technical Approach

### Auth Providers

```typescript
// app/api/auth/[...nextauth]/route.ts
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
  }),
]
```

### Database Changes

- Account model already exists (NextAuth PrismaAdapter)
- Extend with `providerAccountId` for platform linking
- Add `UserProfile` model for display name, photo

### Profile Page

- New page at `/profile`
- Shows linked accounts with connect/disconnect buttons
- Displays profile photo and name from OAuth provider

## UI/UX

### Profile Page Layout

- Centered card layout (similar to auth pages)
- Profile photo + display name header
- List of connected accounts with status
- Connect/Disconnect buttons for each platform
- Account deletion section at bottom

### OAuth Flow

1. User clicks "Sign in with Google/Facebook"
2. Redirect to provider's OAuth consent screen
3. Provider redirects back with auth code
4. NextAuth handles token exchange and session creation
5. User redirected to `/generate`

## Open Questions

1. Should we store OAuth tokens for later use (posting, analytics)? Yes — needed for Phase 5.
2. Should we support email/password login alongside OAuth? Yes — keep existing email/password as fallback.

## Dependencies

- Builds on existing NextAuth setup
- No dependencies on other phases

## Success Criteria

1. User can sign in with Google and see their profile photo
2. User can sign in with Facebook and see their profile photo
3. User can link/unlink accounts from profile page
4. Sessions persist across browser refresh
5. Existing email/password login still works
