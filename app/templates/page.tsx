'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { templates, Template } from '@/lib/templates';

const platformFilters = ['All', 'TikTok', 'Instagram', 'Facebook'] as const;

const platformColors: Record<string, string> = {
  TikTok: 'bg-tiktok',
  Instagram: 'bg-instagram',
  Facebook: 'bg-facebook',
};

const platformBorders: Record<string, string> = {
  TikTok: 'border-t-tiktok',
  Instagram: 'border-t-instagram',
  Facebook: 'border-t-facebook',
};

export default function TemplatesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered =
    activeFilter === 'All'
      ? templates
      : templates.filter((t) => t.platform === activeFilter);

  const handleUseTemplate = (template: Template) => {
    const params = new URLSearchParams({ templateId: template.id });
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      <div className="mx-auto max-w-[1200px] px-8 py-10 max-md:px-4 max-md:py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-panel bg-primary-50">
              <LayoutGrid size={20} className="text-primary" />
            </div>
            <h1 className="text-[28px] font-semibold text-text-primary">
              Trending Templates
            </h1>
          </div>
          <p className="text-text-secondary">
            Browse trending content formats for each platform. Pick a template to get started instantly.
          </p>
        </div>

        {/* Platform Filter Tabs */}
        <div className="mb-8 flex gap-2">
          {platformFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={clsx(
                'rounded-control border px-4 py-2 text-sm font-medium transition-all',
                activeFilter === filter
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-border bg-surface text-text-secondary hover:border-border-strong'
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-4">
          {filtered.map((template) => (
            <div
              key={template.id}
              className={clsx(
                'group rounded-panel border border-border bg-surface p-5 border-t-[3px] transition-all duration-200 hover:shadow-card-hover hover:border-border-strong',
                platformBorders[template.platform]
              )}
            >
              {/* Platform Badge */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      'flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold text-white',
                      platformColors[template.platform]
                    )}
                  >
                    {template.platform === 'TikTok'
                      ? 'TT'
                      : template.platform === 'Instagram'
                      ? 'IG'
                      : 'FB'}
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {template.platform}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="mb-2 text-base font-semibold text-text-primary">
                {template.title}
              </h3>

              {/* Description */}
              <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                {template.description}
              </p>

              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-surface-subtle px-2 py-0.5 text-xs font-medium text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleUseTemplate(template)}
                className="flex w-full items-center justify-center gap-2 rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-all group-hover:border-primary group-hover:bg-primary-50 group-hover:text-primary"
              >
                <Sparkles size={14} />
                Use this template
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="rounded-panel border border-border bg-surface py-16 text-center">
            <p className="text-text-secondary">No templates found for this platform.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
