import { prisma } from '@/lib/prisma';

export interface AnalyticsData {
  totalPosts: number;
  postsThisWeek: number;
  mostUsedPlatform: string | null;
  postsByPlatform: { platform: string; count: number }[];
  postsOverTime: { date: string; count: number }[];
  recentPosts: {
    id: string;
    platform: string;
    post: string;
    createdAt: string;
  }[];
}

/**
 * Get total posts count for a user
 */
export async function getTotalPosts(userId: string): Promise<number> {
  return prisma.content.count({
    where: { userId },
  });
}

/**
 * Get posts count from last 7 days
 */
export async function getPostsThisWeek(userId: string): Promise<number> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return prisma.content.count({
    where: {
      userId,
      createdAt: { gte: weekAgo },
    },
  });
}

/**
 * Get posts grouped by platform with counts
 */
export async function getPostsByPlatform(
  userId: string
): Promise<{ platform: string; count: number }[]> {
  const result = await prisma.content.groupBy({
    by: ['platform'],
    where: { userId },
    _count: true,
    orderBy: { _count: { platform: 'desc' } },
  });

  return result.map((item) => ({
    platform: item.platform,
    count: item._count,
  }));
}

/**
 * Get most used platform for a user
 */
export async function getMostUsedPlatform(
  userId: string
): Promise<string | null> {
  const platforms = await getPostsByPlatform(userId);
  return platforms.length > 0 ? platforms[0].platform : null;
}

/**
 * Get posts over time for the last N days
 */
export async function getPostsOverTime(
  userId: string,
  days: number = 30
): Promise<{ date: string; count: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const posts = await prisma.content.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const grouped: Record<string, number> = {};
  posts.forEach((post) => {
    const date = post.createdAt.toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  // Fill in missing dates with 0
  const result: { date: string; count: number }[] = [];
  const current = new Date(startDate);
  const now = new Date();

  while (current <= now) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: grouped[dateStr] || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Get recent posts for a user
 */
export async function getRecentPosts(
  userId: string,
  limit: number = 10
): Promise<
  { id: string; platform: string; post: string; createdAt: string }[]
> {
  const posts = await prisma.content.findMany({
    where: { userId },
    select: {
      id: true,
      platform: true,
      post: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
  }));
}

/**
 * Get full analytics data for a user
 */
export async function getAnalyticsData(
  userId: string
): Promise<AnalyticsData> {
  const [
    totalPosts,
    postsThisWeek,
    postsByPlatform,
    mostUsedPlatform,
    postsOverTime,
    recentPosts,
  ] = await Promise.all([
    getTotalPosts(userId),
    getPostsThisWeek(userId),
    getPostsByPlatform(userId),
    getMostUsedPlatform(userId),
    getPostsOverTime(userId),
    getRecentPosts(userId),
  ]);

  return {
    totalPosts,
    postsThisWeek,
    mostUsedPlatform,
    postsByPlatform,
    postsOverTime,
    recentPosts,
  };
}
