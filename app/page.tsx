'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';
import { ClipboardPen, Cpu, Send } from 'lucide-react';

const steps = [
  {
    num: 1,
    title: 'Describe',
    desc: 'Fill out one simple form with your business details, campaign topic, and preferred tone.',
    icon: ClipboardPen,
    color: 'bg-primary-50 text-primary',
  },
  {
    num: 2,
    title: 'Generate',
    desc: 'AI creates tailored posts for TikTok, Instagram, and Facebook — each optimized for the platform.',
    icon: Cpu,
    color: 'bg-tiktok text-white',
  },
  {
    num: 3,
    title: 'Publish',
    desc: 'Copy your content with one click and paste it into your scheduling tool or post right away.',
    icon: Send,
    color: 'bg-facebook text-white',
  },
];

const stats = [
  { value: '3', label: 'Platforms', sublabel: 'TikTok, Instagram, Facebook' },
  { value: '<10s', label: 'Avg. generation', sublabel: 'From idea to ready-to-post' },
  { value: '100%', label: 'Free to use', sublabel: 'No credit card required' },
  { value: '5+', label: 'Content types', sublabel: 'Posts, captions, hashtags, CTAs' },
];

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      {/* Hero */}
      <section className="px-8 py-20 max-md:px-4 max-md:py-12">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 [grid-template-columns:1.1fr_0.9fr] max-md:[grid-template-columns:1fr]">
          <div>
            <h1 className="text-[36px] font-semibold leading-[1.15] text-text-primary max-md:text-[28px]">
              Generate social media content in seconds
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-text-secondary max-md:text-base">
              Describe your campaign. Pick your platforms. Get ready-to-post content powered by AI.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {session ? (
                <Link
                  href="/generate"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:bg-primary-700"
                >
                  Generate Content →
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:bg-primary-700"
                  >
                    Try it now
                  </Link>
                  <Link
                    href="/generate"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-control border-2 border-primary-200 bg-primary-50 px-7 py-3.5 text-base font-semibold text-primary transition-all duration-150 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                  >
                    Preview generate page
                  </Link>
                </>
              )}
              <a
                href="#how"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-control border-2 border-border bg-surface px-7 py-3.5 text-base font-semibold text-text-secondary transition-all duration-150 hover:border-border-strong hover:text-text-primary"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Static Mockup */}
          <div className="rounded-panel border border-border bg-surface p-5 shadow-card [transform:perspective(800px)_rotateY(-2deg)] max-md:[transform:none]">
            <div className="mb-3 flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-border-strong" />
              <div className="h-2 w-2 rounded-full bg-border-strong" />
              <div className="h-2 w-2 rounded-full bg-border-strong" />
            </div>
            <div className="p-3">
              {/* Platform tabs */}
              <div className="mb-3 flex gap-2">
                {['TikTok', 'Instagram', 'Facebook'].map((p) => (
                  <div key={p} className="flex-1 rounded-lg border border-border bg-surface p-2">
                    <div className="mb-1 h-2.5 w-12 rounded bg-border" />
                    <div className="h-1.5 w-16 rounded bg-border" />
                  </div>
                ))}
              </div>
              {/* Campaign field */}
              <div className="mb-3 rounded-lg border border-border bg-surface p-3">
                <div className="mb-1.5 text-[10px] font-semibold uppercase text-text-muted">
                  Campaign
                </div>
                <div className="mb-1 h-2.5 w-[80%] rounded bg-border" />
                <div className="h-2 w-[60%] rounded bg-border" />
              </div>
              {/* Result cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border bg-surface p-2 border-t-[3px] border-t-tiktok">
                  <div className="text-[9px] font-semibold text-tiktok">TikTok</div>
                  <div className="mt-1.5 h-1 w-full rounded bg-border" />
                  <div className="mt-1 h-1 w-[70%] rounded bg-border" />
                </div>
                <div className="rounded-lg border border-border bg-surface p-2 border-t-[3px] border-t-instagram">
                  <div className="text-[9px] font-semibold text-instagram">Instagram</div>
                  <div className="mt-1.5 h-1 w-full rounded bg-border" />
                  <div className="mt-1 h-1 w-[70%] rounded bg-border" />
                </div>
                <div className="rounded-lg border border-border bg-surface p-2 border-t-[3px] border-t-facebook">
                  <div className="text-[9px] font-semibold text-facebook">Facebook</div>
                  <div className="mt-1.5 h-1 w-full rounded bg-border" />
                  <div className="mt-1 h-1 w-[70%] rounded bg-border" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Visual Step Timeline */}
      <section id="how" className="px-8 py-20 max-md:px-4 max-md:py-14">
        <div className="mx-auto max-w-[1000px]">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[12px] font-semibold text-primary mb-4">
              Simple workflow
            </div>
            <h2 className="text-[32px] font-semibold text-text-primary max-md:text-[24px]">
              How it works
            </h2>
            <p className="mt-3 text-base text-text-secondary max-md:text-sm">
              One form. Three platforms. Zero guesswork.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connecting line — desktop */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border max-md:hidden" />

            <div className="space-y-12 max-md:space-y-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isLeft = i % 2 === 0;
                return (
                  <div key={step.num} className="relative flex items-center max-md:flex-col max-md:items-start">
                    {/* Desktop: alternating layout */}
                    <div className={`hidden max-md:hidden md:flex w-full items-center gap-8 ${isLeft ? '' : 'flex-row-reverse'}`}>
                      {/* Content side */}
                      <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                        <div className="relative inline-block rounded-panel border border-border bg-surface p-6 transition-colors duration-200 hover:border-primary-200 hover:shadow-card-hover">
                          <span className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white shadow-card">
                            {step.num}
                          </span>
                          <h3 className="mb-2 text-[18px] font-semibold text-text-primary">{step.title}</h3>
                          <p className="text-[14px] leading-relaxed text-text-secondary">{step.desc}</p>
                        </div>
                      </div>

                      {/* Center node */}
                      <div className="relative z-10 flex shrink-0 items-center justify-center">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${step.color} shadow-card`}>
                          <Icon size={24} />
                        </div>
                      </div>

                      {/* Empty side */}
                      <div className="flex-1" />
                    </div>

                    {/* Mobile: stacked layout */}
                    <div className="md:hidden flex items-start gap-4 w-full">
                      <div className="relative z-10 flex shrink-0 items-center justify-center">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.color} shadow-card`}>
                          <Icon size={20} />
                        </div>
                      </div>
                      <div className="relative flex-1 rounded-panel border border-border bg-surface p-5 transition-colors duration-200 hover:border-primary-200">
                        <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white shadow-card">
                          {step.num}
                        </span>
                        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Step {step.num}</div>
                        <h3 className="mb-1.5 text-[16px] font-semibold text-text-primary">{step.title}</h3>
                        <p className="text-[13px] leading-relaxed text-text-secondary">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link
              href={session ? '/generate' : '/auth/signup'}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-control bg-primary px-8 py-3.5 text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:bg-primary-700"
            >
              {session ? 'Start generating →' : 'Get started free →'}
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof — Stat Cards */}
      <section className="px-8 py-20 max-md:px-4 max-md:py-14 bg-surface-subtle/50">
        <div className="mx-auto max-w-[900px]">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[12px] font-semibold text-primary mb-4">
              By the numbers
            </div>
            <h2 className="text-[32px] font-semibold text-text-primary max-md:text-[24px]">
              Built for speed
            </h2>
            <p className="mt-3 text-base text-text-secondary max-md:text-sm">
              Everything you need to go from idea to published content — fast.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-panel border border-border bg-surface p-7 text-center transition-colors duration-200 hover:border-primary-200 hover:shadow-card-hover group"
              >
                <div className="text-[36px] font-bold text-primary leading-none mb-2 tabular-nums max-md:text-[28px]">
                  {s.value}
                </div>
                <div className="text-sm font-medium text-text-secondary mb-1">
                  {s.label}
                </div>
                <div className="text-[12px] text-text-muted">
                  {s.sublabel}
                </div>
              </div>
            ))}
          </div>
          {/* Platform logos */}
          <div className="mt-10 flex items-center justify-center gap-8 max-md:gap-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary opacity-60">
              <span className="h-2.5 w-2.5 rounded-full bg-tiktok" />
              TikTok
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary opacity-60">
              <span className="h-2.5 w-2.5 rounded-full bg-instagram" />
              Instagram
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary opacity-60">
              <span className="h-2.5 w-2.5 rounded-full bg-facebook" />
              Facebook
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
