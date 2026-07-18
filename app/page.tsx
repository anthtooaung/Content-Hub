import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';

const steps = [
  {
    num: 1,
    title: 'Describe',
    desc: 'Fill out one simple form with your business details, campaign topic, and preferred tone.',
  },
  {
    num: 2,
    title: 'Generate',
    desc: 'AI creates tailored posts for TikTok, Instagram, and Facebook — each optimized for the platform.',
  },
  {
    num: 3,
    title: 'Publish',
    desc: 'Copy your content with one click and paste it into your scheduling tool or post right away.',
  },
];

const testimonials = [
  {
    text: 'I used to spend 2 hours writing social posts. Now I describe my weekend special and have content for all three platforms in under a minute.',
    author: 'Sarah Chen',
    role: 'Owner, Bloom & Brew Coffee',
    initials: 'SC',
    color: 'bg-instagram',
  },
  {
    text: 'The platform-specific optimization is spot on. TikTok posts feel like TikTok, Instagram feels like Instagram. No more one-size-fits-all.',
    author: 'Marcus Johnson',
    role: 'Freelance Marketer',
    initials: 'MJ',
    color: 'bg-primary',
  },
  {
    text: 'Finally, an AI tool that doesn\'t try to do everything. It does one thing really well — and that\'s exactly what I needed.',
    author: 'Priya Patel',
    role: 'Fitness Coach, MoveStudio',
    initials: 'PP',
    color: 'bg-tiktok',
  },
];

const stats = [
  { value: '3', label: 'Platforms', sublabel: 'TikTok, Instagram, Facebook' },
  { value: '<10s', label: 'Avg. generation', sublabel: 'From idea to ready-to-post' },
  { value: '100%', label: 'Free to use', sublabel: 'No credit card required' },
  { value: '5+', label: 'Content types', sublabel: 'Posts, captions, hashtags, CTAs' },
];

export default function Home() {
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
              <Link
                href="/auth/signup"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:translate-y-0 active:bg-primary-700"
              >
                Try it now
              </Link>
              <a
                href="#how"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-control border-2 border-primary bg-primary-50 px-7 py-3.5 text-base font-semibold text-primary transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
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

      {/* How It Works — Horizontal Process Flow */}
      <section id="how" className="px-8 py-16 max-md:px-4 max-md:py-12">
        <div className="mx-auto max-w-[1000px]">
          <div className="text-center mb-12">
            <h2 className="text-[28px] font-semibold text-text-primary max-md:text-[22px]">
              How it works
            </h2>
            <p className="mt-3 text-base text-text-secondary max-md:text-sm">
              One form. Three platforms. Zero guesswork.
            </p>
          </div>
          <div className="flex max-md:flex-col">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="group flex-1 relative bg-surface border border-border px-8 py-8 text-center transition-all duration-200 hover:bg-primary-50 hover:border-primary-200 max-md:border-b-0 max-md:px-6 max-md:py-6 first:rounded-l-panel last:rounded-r-panel max-md:first:rounded-t-panel max-md:last:rounded-b-panel max-md:last:border-b max-md:border-b-border"
              >
                {/* Step badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[12px] font-semibold text-primary mb-4">
                  Step {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-text-secondary">{step.desc}</p>
                {/* Arrow connector — desktop only */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden max-md:hidden">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-[13px] text-primary font-medium">
                      →
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/auth/signup"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:translate-y-0 active:bg-primary-700"
            >
              Get started free →
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof — Stat Cards */}
      <section id="proof" className="px-8 py-16 max-md:px-4 max-md:py-12 bg-surface-subtle/50">
        <div className="mx-auto max-w-[900px]">
          <div className="text-center mb-12">
            <h2 className="text-[28px] font-semibold text-text-primary max-md:text-[22px]">
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
                className="rounded-panel border border-border bg-surface p-7 text-center transition-all duration-200 hover:border-primary-200 hover:shadow-card-hover hover:-translate-y-0.5 group"
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
