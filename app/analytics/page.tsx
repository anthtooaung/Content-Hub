'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

interface AnalyticsData {
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

const platformColors: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#000000',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
};

const PIE_COLORS = ['#1877F2', '#E4405F', '#000000', '#1DA1F2', '#0A66C2'];

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      showToast('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface-subtle rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-surface-subtle rounded-control" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-surface-subtle rounded-control" />
              <div className="h-80 bg-surface-subtle rounded-control" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!analytics) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <EmptyState
            icon={<BarChart3 size={40} />}
            title="No analytics data"
            message="Start generating content to see your analytics."
            action={
              <button
                onClick={() => router.push('/generate')}
                className="px-4 py-2 bg-primary text-white rounded-control hover:bg-primary-hover transition-colors"
              >
                Generate Content
              </button>
            }
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary mt-1">
            Track your content generation activity
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={FileText}
            label="Total Posts"
            value={analytics.totalPosts}
            color="text-primary"
          />
          <SummaryCard
            icon={Calendar}
            label="This Week"
            value={analytics.postsThisWeek}
            color="text-green-600"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Most Used"
            value={analytics.mostUsedPlatform || 'N/A'}
            color="text-blue-600"
            isText
          />
          <SummaryCard
            icon={BarChart3}
            label="Platforms"
            value={analytics.postsByPlatform.length}
            color="text-purple-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart - Posts Over Time */}
          <div className="bg-surface border border-border rounded-control p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Posts Over Time
            </h2>
            {analytics.postsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.postsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-muted">
                No data available
              </div>
            )}
          </div>

          {/* Pie Chart - Posts by Platform */}
          <div className="bg-surface border border-border rounded-control p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Posts by Platform
            </h2>
            {analytics.postsByPlatform.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.postsByPlatform}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="platform"
                  >
                    {analytics.postsByPlatform.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          platformColors[entry.platform] ||
                          PIE_COLORS[index % PIE_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-muted">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface border border-border rounded-control p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Recent Activity
          </h2>
          {analytics.recentPosts.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start gap-3 p-3 rounded-control hover:bg-surface-subtle transition-colors"
                >
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white shrink-0"
                    style={{
                      backgroundColor:
                        platformColors[post.platform] || '#6B7280',
                    }}
                  >
                    {post.platform}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary line-clamp-2">
                      {post.post}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-center py-8">
              No recent activity
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
  isText = false,
}: {
  icon: typeof FileText;
  label: string;
  value: number | string;
  color: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-control p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p
            className={`text-2xl font-bold ${isText ? 'text-lg' : ''} text-text-primary mt-1`}
          >
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-control bg-surface-subtle ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
