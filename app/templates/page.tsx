'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import AppLayout from '@/components/AppLayout';
import { templates, Template } from '@/lib/templates';

const platformFilters = ['All', 'TikTok', 'Instagram', 'Facebook'] as const;

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

  return (
    <AppLayout>
      <div className="px-8 py-10 max-md:px-4 max-md:py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-text-primary max-md:text-[20px]">
            Templates
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Top Tab Navigation */}
        <div className="mb-6 flex gap-1 rounded-control border border-border bg-surface p-1">
          {platformFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={clsx(
                'flex items-center gap-2 rounded-control px-4 py-2 text-[13px] font-medium transition-colors duration-150',
                activeFilter === filter
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
              )}
            >
              {filter !== 'All' && (
                <span
                  className={clsx(
                    'h-2 w-2 rounded-full',
                    activeFilter === filter ? 'bg-white/70' : `bg-${filter.toLowerCase()}`
                  )}
                />
              )}
              {filter === 'All' ? 'All Templates' : filter}
              <span
                className={clsx(
                  'rounded-full px-1.5 py-px text-[10px] font-semibold',
                  activeFilter === filter
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-subtle text-text-muted'
                )}
              >
                {platformCounts[filter]}
              </span>
            </button>
          ))}
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
      </div>
    </AppLayout>
  );
}

function TemplateCard({ template, onUse }: { template: Template; onUse: (t: Template) => void }) {
  const cardStyles: Record<string, { header: string; badge: string; cta: string; tagBg: string; tagText: string }> = {
    TikTok: {
      header: 'bg-gradient-to-br from-[#010101] via-[#0a0a1a] to-[#1a1a2e]',
      badge: 'bg-[#00F2EA] text-[#010101]',
      cta: 'bg-tiktok hover:bg-[#2a2a3e]',
      tagBg: 'bg-[#00F2EA]/10',
      tagText: 'text-[#00F2EA]',
    },
    Instagram: {
      header: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]',
      badge: 'bg-white text-instagram',
      cta: 'bg-instagram hover:bg-instagram/90',
      tagBg: 'bg-instagram/10',
      tagText: 'text-instagram',
    },
    Facebook: {
      header: 'bg-gradient-to-br from-[#1877F2] to-[#0d5bbd]',
      badge: 'bg-white text-facebook',
      cta: 'bg-facebook hover:bg-facebook/90',
      tagBg: 'bg-facebook/10',
      tagText: 'text-facebook',
    },
  };

  const style = cardStyles[template.platform] || cardStyles.Facebook;

  return (
    <div className="group rounded-panel border border-border bg-surface overflow-hidden transition-colors duration-200 hover:shadow-card-hover">
      {/* Platform Visual Header */}
      <div className={clsx('relative flex h-[100px] items-center justify-center overflow-hidden', style.header)}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          {template.platform === 'TikTok' && (
            <>
              <div className="absolute left-4 top-4 h-16 w-16 rounded-full border border-[#00F2EA]/30" />
              <div className="absolute right-6 bottom-3 h-8 w-8 rounded-md border border-[#FF0050]/20 rotate-12" />
              <div className="absolute right-14 top-2 h-4 w-4 rounded-full bg-[#00F2EA]/10" />
            </>
          )}
          {template.platform === 'Instagram' && (
            <>
              <div className="absolute left-6 top-3 h-12 w-12 rounded-full border border-white/30" />
              <div className="absolute right-4 bottom-4 h-10 w-10 rounded-full border border-white/20" />
              <div className="absolute right-16 top-6 h-6 w-6 rounded-md border border-white/15 rotate-45" />
            </>
          )}
          {template.platform === 'Facebook' && (
            <>
              <div className="absolute left-5 top-5 h-14 w-14 rounded-full border border-white/30" />
              <div className="absolute right-5 bottom-4 h-8 w-8 rounded-md border border-white/20 rotate-12" />
            </>
          )}
        </div>
        <span className="relative text-[44px] font-extrabold text-white/20 select-none">
          {template.platform === 'TikTok' ? 'TT' : template.platform === 'Instagram' ? 'IG' : 'FB'}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Platform Badge */}
        <div className="mb-2.5">
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold', style.badge)}>
            <span className="h-1.5 w-1.5 rounded-full bg-current/50" />
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
              className={clsx('rounded-md px-2 py-0.5 text-[11px] font-medium', style.tagBg, style.tagText)}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onUse(template)}
          className={clsx(
            'flex w-full items-center justify-center gap-1.5 rounded-control px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 hover:shadow-md',
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
