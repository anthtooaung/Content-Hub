'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import AppLayout from '@/components/AppLayout';
import { templates, Template } from '@/lib/templates';

const platformFilters = ['All', 'TikTok', 'Instagram', 'Facebook'] as const;

const platformDotColors: Record<string, string> = {
  TikTok: 'bg-tiktok',
  Instagram: 'bg-instagram',
  Facebook: 'bg-facebook',
};

const platformGradients: Record<string, string> = {
  TikTok: 'from-[#00F2EA] to-[#FF0050]',
  Instagram: 'from-[#F09433] via-[#DC2743] to-[#BC1888]',
  Facebook: 'bg-facebook',
};

const platformCtaColors: Record<string, string> = {
  TikTok: 'bg-tiktok',
  Instagram: 'bg-instagram',
  Facebook: 'bg-facebook',
};

export default function TemplatesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered =
    activeFilter === 'All'
      ? templates
      : templates.filter((t) => t.platform === activeFilter);

  const platformCounts = {
    All: templates.length,
    TikTok: templates.filter((t) => t.platform === 'TikTok').length,
    Instagram: templates.filter((t) => t.platform === 'Instagram').length,
    Facebook: templates.filter((t) => t.platform === 'Facebook').length,
  };

  const handleUseTemplate = (template: Template) => {
    const params = new URLSearchParams({ templateId: template.id });
    router.push(`/generate?${params.toString()}`);
  };

  const sidebarItems = [
    { id: 'All', label: 'All Templates', icon: <LayoutGrid size={16} /> },
    { id: 'TikTok', label: 'TikTok', icon: <span className="h-2.5 w-2.5 rounded-full bg-tiktok" /> },
    { id: 'Instagram', label: 'Instagram', icon: <span className="h-2.5 w-2.5 rounded-full bg-instagram" /> },
    { id: 'Facebook', label: 'Facebook', icon: <span className="h-2.5 w-2.5 rounded-full bg-facebook" /> },
  ] as const;

  return (
    <AppLayout>
      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-[240px] shrink-0 border-r border-border bg-surface p-5 max-md:hidden">
          <div className="mb-6">
            <div className="text-[20px] font-semibold text-text-primary">Templates</div>
            <p className="mt-1 text-[13px] text-text-muted">Browse by platform</p>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveFilter(item.id)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-control px-3.5 py-2.5 text-left text-[13px] font-medium transition-all',
                  activeFilter === item.id
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                )}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                <span
                  className={clsx(
                    'rounded-full px-2 py-px text-[11px] font-semibold',
                    activeFilter === item.id
                      ? 'bg-primary text-white'
                      : 'bg-surface-subtle text-text-muted'
                  )}
                >
                  {platformCounts[item.id]}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-10 max-md:px-4 max-md:py-6">
          {/* Mobile filter pills */}
          <div className="mb-6 flex gap-2 overflow-x-auto md:hidden">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveFilter(item.id)}
                className={clsx(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-control border px-3.5 py-2 text-[13px] font-medium transition-all',
                  activeFilter === item.id
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-border bg-surface text-text-secondary'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-[24px] font-semibold text-text-primary max-md:text-[20px]">
              {activeFilter === 'All' ? 'All Templates' : `${activeFilter} Templates`}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-3 gap-5 max-xl:grid-cols-2 max-md:grid-cols-1 max-md:gap-4">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
              />
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="rounded-panel border border-border bg-surface py-16 text-center">
              <p className="text-text-secondary">No templates found for this platform.</p>
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}

function TemplateCard({ template, onUse }: { template: Template; onUse: (t: Template) => void }) {
  const cardStyles: Record<string, { header: string; badge: string; cta: string }> = {
    TikTok: {
      header: 'bg-gradient-to-br from-[#010101] to-[#1a1a2e]',
      badge: 'bg-tiktok text-white',
      cta: 'bg-tiktok hover:bg-tiktok/90',
    },
    Instagram: {
      header: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]',
      badge: 'bg-instagram text-white',
      cta: 'bg-instagram hover:bg-instagram/90',
    },
    Facebook: {
      header: 'bg-gradient-to-br from-[#1877F2] to-[#0d47a1]',
      badge: 'bg-facebook text-white',
      cta: 'bg-facebook hover:bg-facebook/90',
    },
  };

  const style = cardStyles[template.platform] || cardStyles.Facebook;

  return (
    <div className="group rounded-panel border border-border bg-surface overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      {/* Platform Visual Header */}
      <div className={clsx('relative flex h-[90px] items-center justify-center', style.header)}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-4 top-4 h-16 w-16 rounded-full border border-white/30" />
          <div className="absolute right-6 bottom-3 h-8 w-8 rounded-md border border-white/20 rotate-12" />
        </div>
        <span className="relative text-[40px] font-extrabold text-white/25 select-none">
          {template.platform === 'TikTok' ? 'TT' : template.platform === 'Instagram' ? 'IG' : 'FB'}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Platform Badge */}
        <div className="mb-2.5">
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', style.badge)}>
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            {template.platform}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-1.5 text-[15px] font-semibold text-text-primary leading-snug">
          {template.title}
        </h3>

        {/* Description */}
        <p className="mb-3 text-[13px] leading-relaxed text-text-secondary line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onUse(template)}
          className={clsx(
            'flex w-full items-center justify-center gap-1.5 rounded-control px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md',
            style.cta
          )}
        >
          <Sparkles size={14} />
          Use Template
        </button>
      </div>
    </div>
  );
}
