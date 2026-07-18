# Phase 6: Analytics & Reporting — Context

## Goal

Users can view usage statistics for their generated content and see basic activity trends.

## Why This Phase

Analytics help users understand their content generation patterns and make data-driven decisions about their content strategy.

## Requirements

### Must Have

- Track: content generated, last accessed, view count
- Usage dashboard: total posts, posts by platform, activity timeline
- Basic charts: posts over time, platform distribution

### Should Have

- Export analytics data as CSV
- Date range filtering

### Nice to Have

- Compare periods (this month vs last month)
- Content performance metrics (if platform APIs provide data)

## Technical Approach

### Database Changes

```prisma
model Content {
  // ... existing fields
  viewCount      Int      @default(0)
  lastAccessedAt DateTime?
}
```

### Analytics Aggregation

```typescript
// app/api/analytics/route.ts
async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  const totalPosts = await prisma.content.count({
    where: { userId: session.user.id }
  });

  const postsByPlatform = await prisma.content.groupBy({
    by: ['platform'],
    where: { userId: session.user.id },
    _count: true
  });

  const postsOverTime = await prisma.content.groupBy({
    by: ['createdAt'],
    where: {
      userId: session.user.id,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    _count: true
  });

  return Response.json({
    totalPosts,
    postsByPlatform,
    postsOverTime
  });
}
```

### Charts

- Use lightweight chart library (Chart.js or recharts)
- Line chart: posts over time
- Pie/donut chart: posts by platform
- Simple bar chart: top platforms

## UI/UX

### Analytics Dashboard

- New page at `/dashboard/analytics`
- Summary cards: total posts, posts this week, most used platform
- Charts section: line chart (activity), donut chart (platforms)
- Recent activity list: last 10 generated posts

### Dashboard Integration

- "Analytics" tab in dashboard navigation
- Quick stats sidebar on main dashboard page

### Responsive Design

- Charts stack vertically on mobile
- Summary cards grid: 2 columns on mobile, 4 on desktop

## Open Questions

1. **Storage:** Should analytics be stored in the existing Content model (add fields) or a separate analytics table for better query performance?
2. **Chart library:** Chart.js (lightweight, simple) or recharts (React-native, more flexible)?

## Dependencies

- No dependencies on other phases (can run in parallel)
- Builds on existing Content model

## Success Criteria

1. User can see total posts generated count
2. User can see posts by platform breakdown
3. User can see activity timeline (posts over last 30 days)
4. Charts render correctly on desktop and mobile
5. Analytics page loads in under 2 seconds
