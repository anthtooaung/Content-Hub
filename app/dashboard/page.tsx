'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Plus, FileText, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';

interface ContentItem {
  id: string;
  platform: string;
  tone: string;
  post: string;
  hashtags: string[];
  caption: string;
  callToAction?: string;
  createdAt: string;
}

const platformColors: Record<string, string> = {
  TikTok: 'bg-tiktok',
  Instagram: 'bg-instagram',
  Facebook: 'bg-facebook',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function groupByDate(items: ContentItem[]): Record<string, ContentItem[]> {
  const groups: Record<string, ContentItem[]> = {};
  for (const item of items) {
    const label = formatDate(item.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}

export default function DashboardPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPost = (item: ContentItem) => {
    const text = `${item.post}\n\n${item.hashtags?.join(' ')}\n\n${item.caption}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const groups = groupByDate(content);

  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      <div className="mx-auto max-w-[1200px] px-8 py-10 max-md:px-4 max-md:py-6">
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-text-secondary">Your generated content history</p>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-border border-t-primary" />
            <p className="text-text-secondary">Loading content...</p>
          </div>
        ) : content.length === 0 ? (
          /* Empty State */
          <div className="rounded-panel border border-border bg-surface py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-panel bg-surface-subtle">
              <FileText size={36} className="text-text-muted" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">No content yet</h3>
            <p className="mb-6 text-text-secondary">
              Generate your first social media posts and they&apos;ll appear here.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded-control bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-600 active:translate-y-0"
            >
              <Sparkles size={16} />
              Generate your first post
            </Link>
          </div>
        ) : (
          /* Timeline */
          <div className="relative pl-10">
            {/* Timeline spine */}
            <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

            {Object.entries(groups).map(([date, items]) => (
              <div key={date} className="mb-8 last:mb-0">
                {/* Date marker */}
                <div className="relative mb-4">
                  <div className="absolute -left-[33px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
                  <h3 className="text-sm font-semibold text-text-secondary">{date}</h3>
                </div>

                {/* Cards */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-panel border border-border bg-surface p-4 transition-all duration-150 hover:shadow-card-hover hover:border-border-strong"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={clsx(
                              'flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold text-white',
                              platformColors[item.platform]
                            )}
                          >
                            {item.platform === 'TikTok'
                              ? 'TT'
                              : item.platform === 'Instagram'
                              ? 'IG'
                              : 'FB'}
                          </div>
                          <span className="text-sm font-semibold text-text-primary">
                            {item.platform}
                          </span>
                          <span className="rounded bg-surface-subtle px-2 py-0.5 text-xs text-text-muted">
                            {item.tone}
                          </span>
                        </div>
                        <span className="text-xs text-text-muted">
                          {new Date(item.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Preview text */}
                      <p
                        className={clsx(
                          'mb-3 text-sm leading-relaxed text-text-primary',
                          expandedId !== item.id && 'line-clamp-3'
                        )}
                      >
                        {item.post}
                      </p>

                      {/* Hashtags */}
                      {item.hashtags?.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {item.hashtags.map((tag: string, i: number) => (
                            <span key={i} className="text-[13px] text-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === item.id ? null : item.id)
                          }
                          className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-all hover:border-border-strong hover:bg-surface-subtle"
                        >
                          {expandedId === item.id ? (
                            <><ChevronUp size={14} /> Show less</>
                          ) : (
                            <><ChevronDown size={14} /> Show more</>
                          )}
                        </button>
                        <button
                          onClick={() => copyPost(item)}
                          className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-all hover:border-primary-border hover:bg-primary-50 hover:text-primary"
                        >
                          {copiedId === item.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                        </button>
                      </div>

                      {/* Expanded content */}
                      {expandedId === item.id && (
                        <div className="mt-3 space-y-2 border-t border-border pt-3">
                          {item.caption && (
                            <div>
                              <div className="mb-1 text-xs font-semibold text-text-muted">
                                Caption
                              </div>
                              <p className="text-sm text-text-secondary">{item.caption}</p>
                            </div>
                          )}
                          {item.callToAction && (
                            <div>
                              <div className="mb-1 text-xs font-semibold text-text-muted">
                                Call to Action
                              </div>
                              <p className="text-sm font-semibold text-text-secondary">
                                {item.callToAction}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
