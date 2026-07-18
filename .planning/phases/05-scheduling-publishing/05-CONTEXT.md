# Phase 5: Scheduling & Publishing — Context

## Goal

Users can schedule and publish generated content directly to Facebook and Instagram via their APIs.

## Why This Phase

Scheduling and publishing is the core value-add after content generation. Users want to go from "generate content" to "post it" without copy-pasting.

## Requirements

### Must Have

- Schedule content: pick a date/time for each platform
- Real posting: publish to Facebook via Graph API
- Real posting: publish to Instagram via Basic Display API
- Publishing status: scheduled, posting, posted, failed
- Simple retry on failure (one retry attempt)

### Should Have

- Content queue: view upcoming scheduled posts
- Cancel scheduled posts before they publish

### Nice to Have

- Bulk scheduling (select multiple posts, schedule all at once)

## Technical Approach

### Facebook Graph API

```typescript
// POST to Facebook Page
POST https://graph.facebook.com/v18.0/{page-id}/feed
{
  message: "Post content",
  access_token: "user's page access token"
}
```

- Requires `pages_manage_posts` permission
- User must have a Facebook Page connected to their account

### Instagram Basic Display API

```typescript
// POST to Instagram
POST https://graph.facebook.com/v18.0/{ig-user-id}/media
{
  image_url: "https://...",
  caption: "Post caption",
  access_token: "user's access token"
}

// Publish
POST https://graph.facebook.com/v18.0/{ig-user-id}/media_publish
{
  creation_id: "{media-id}",
  access_token: "user's access token"
}
```

- Requires `instagram_basic` and `instagram_content_publish` permissions
- Two-step process: create media container, then publish

### Database Schema

```prisma
model ScheduledPost {
  id            String   @id @default(cuid())
  userId        String
  contentId     String
  platform      String   // "facebook" | "instagram"
  scheduledAt   DateTime
  status        String   @default("scheduled") // scheduled | posting | posted | failed
  publishedAt   DateTime?
  errorMessage  String?
  retryCount    Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])
  content       Content  @relation(fields: [contentId], references: [id])
}
```

### Scheduling Logic

```typescript
// Server action or cron job
async function processScheduledPosts() {
  const pendingPosts = await prisma.scheduledPost.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: new Date() }
    }
  });

  for (const post of pendingPosts) {
    try {
      await publishToPlatform(post);
      await updateStatus(post.id, "posted");
    } catch (error) {
      if (post.retryCount < 1) {
        await retryPost(post);
      } else {
        await updateStatus(post.id, "failed", error.message);
      }
    }
  }
}
```

## UI/UX

### Schedule Button

- Added to content result cards after generation
- Clicking opens date/time picker modal
- User selects platform (Facebook/Instagram) and date/time
- Confirms scheduling

### Dashboard Integration

- New "Scheduled" tab in dashboard
- Shows upcoming posts with countdown
- Cancel button for each scheduled post
- Status indicators (scheduled, posted, failed)

### Error Handling

- Failed posts show error message with retry button
- Status badges: blue (scheduled), green (posted), red (failed)

## Open Questions

1. **Page vs Profile:** Facebook posting requires a Page, not just a personal profile. Should we require users to have a Facebook Page, or post to their personal profile?
2. **Token refresh:** OAuth tokens expire. Should we implement automatic token refresh, or require users to re-authenticate?

## Dependencies

- Requires Phase 4 (OAuth tokens for platform access)
- Requires existing Content model for post data

## Success Criteria

1. User can schedule a post to Facebook with a date/time
2. User can schedule a post to Instagram with a date/time
3. Scheduled posts publish automatically at the scheduled time
4. Failed posts retry once, then show error with retry button
5. User can view and cancel scheduled posts in dashboard
