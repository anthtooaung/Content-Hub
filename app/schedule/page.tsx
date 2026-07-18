'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Trash2, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

interface ScheduledPost {
  id: string;
  contentId: string;
  platform: string;
  scheduledAt: string;
  status: string;
  publishedAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  content: {
    post: string;
    hashtags: string[];
    caption?: string;
    callToAction?: string;
  };
  socialConnection: {
    provider: string;
    provider_username?: string;
  };
}

const statusConfig: Record<string, { color: string; icon: typeof Calendar; label: string }> = {
  scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Scheduled' },
  publishing: { color: 'bg-yellow-100 text-yellow-800', icon: Loader2, label: 'Publishing' },
  published: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Published' },
  failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Failed' },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: Trash2, label: 'Cancelled' },
};

const platformColors: Record<string, string> = {
  facebook: 'bg-facebook text-white',
  instagram: 'bg-instagram text-white',
};

function formatCountdown(scheduledAt: string): string {
  const now = new Date();
  const target = new Date(scheduledAt);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchScheduledPosts();
    }
  }, [session]);

  // Refresh countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setScheduledPosts((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch('/api/schedule');
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error);
      addToast('Failed to load scheduled posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setScheduledPosts((prev) =>
          prev.map((post) =>
            post.id === id ? { ...post, status: 'cancelled' } : post
          )
        );
        addToast('Scheduled post cancelled', 'success');
      } else {
        addToast('Failed to cancel scheduled post', 'error');
      }
    } catch (error) {
      console.error('Failed to cancel:', error);
      addToast('Failed to cancel scheduled post', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-subtle rounded w-48" />
            <div className="h-4 bg-surface-subtle rounded w-64" />
            <div className="space-y-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-surface-subtle rounded-control" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const activePosts = scheduledPosts.filter((p) => p.status === 'scheduled');
  const pastPosts = scheduledPosts.filter((p) => p.status !== 'scheduled');

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Scheduled Posts</h1>
          <p className="text-text-secondary mt-1">
            Manage your upcoming social media posts
          </p>
        </div>

        {scheduledPosts.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No scheduled posts"
            message="Schedule your generated content to be published automatically at your preferred time."
            action={{
              label: 'Generate Content',
              onClick: () => router.push('/generate'),
            }}
          />
        ) : (
          <>
            {/* Active Scheduled Posts */}
            {activePosts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Upcoming ({activePosts.length})
                </h2>
                <div className="space-y-4">
                  {activePosts.map((post) => (
                    <ScheduledPostCard
                      key={post.id}
                      post={post}
                      onCancel={handleCancel}
                      isCancelling={cancellingId === post.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Posts */}
            {pastPosts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  History ({pastPosts.length})
                </h2>
                <div className="space-y-4">
                  {pastPosts.map((post) => (
                    <ScheduledPostCard
                      key={post.id}
                      post={post}
                      onCancel={handleCancel}
                      isCancelling={cancellingId === post.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function ScheduledPostCard({
  post,
  onCancel,
  isCancelling,
}: {
  post: ScheduledPost;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}) {
  const statusInfo = statusConfig[post.status] || statusConfig.scheduled;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-surface border border-border rounded-control p-4 hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                platformColors[post.platform] || 'bg-gray-100 text-gray-800'
              )}
            >
              {post.platform}
            </span>
            <span
              className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
                statusInfo.color
              )}
            >
              <StatusIcon size={12} />
              {statusInfo.label}
            </span>
          </div>

          <p className="text-sm text-text-primary line-clamp-2 mb-2">
            {post.content.post}
          </p>

          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(post.scheduledAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {new Date(post.scheduledAt).toLocaleTimeString()}
            </span>
            {post.status === 'scheduled' && (
              <span className="font-medium text-primary">
                {formatCountdown(post.scheduledAt)}
              </span>
            )}
          </div>

          {post.errorMessage && (
            <p className="mt-2 text-xs text-red-600">{post.errorMessage}</p>
          )}
        </div>

        {post.status === 'scheduled' && (
          <button
            onClick={() => onCancel(post.id)}
            disabled={isCancelling}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-control transition-colors disabled:opacity-50"
          >
            {isCancelling ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
