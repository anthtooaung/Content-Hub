import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import Footer from '@/components/Footer';

const steps = [
  {
    num: 1,
    title: 'Describe your campaign',
    desc: 'Tell us about your business, what you\'re promoting, and the tone you want. One form, that\'s it.',
  },
  {
    num: 2,
    title: 'Generate content',
    desc: 'Our AI creates platform-specific posts, captions, hashtags, and CTAs — optimized for each network.',
  },
  {
    num: 3,
    title: 'Copy and post',
    desc: 'Review your content, copy what you need, and paste directly into your scheduling tool or post manually.',
  },
];

const testimonials = [
  {
    text: '"I used to spend 2 hours writing social posts. Now I describe my weekend special and have content for all three platforms in under a minute."',
    author: 'Sarah Chen',
    role: 'Owner, Bloom & Brew Coffee',
  },
  {
    text: '"The platform-specific optimization is spot on. TikTok posts feel like TikTok, Instagram feels like Instagram. No more one-size-fits-all."',
    author: 'Marcus Johnson',
    role: 'Freelance Marketer',
  },
  {
    text: '"Finally, an AI tool that doesn\'t try to do everything. It does one thing really well — and that\'s exactly what I needed."',
    author: 'Priya Patel',
    role: 'Fitness Coach, MoveStudio',
  },
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
                className="inline-flex min-h-[48px] items-center gap-2 rounded-control bg-primary px-7 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-600 active:translate-y-0 active:bg-primary-700"
              >
                Try it now
              </Link>
              <a
                href="#how"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-control border border-border bg-surface px-7 py-3.5 text-base font-semibold text-text-primary transition-colors hover:bg-surface-subtle"
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

      {/* How It Works */}
      <section id="how" className="px-8 py-12 max-md:px-4">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-center text-[24px] font-semibold text-text-primary">
            How it works
          </h2>
          <p className="mt-2 text-center text-text-secondary">
            Three steps to your next social media post.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-8 max-md:grid-cols-1 max-md:gap-6">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-xl font-bold text-primary">
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="proof" className="px-8 py-12 max-md:px-4">
        <div className="mx-auto max-w-[1200px] text-center">
          <h2 className="text-[24px] font-semibold text-text-primary">
            What people say
          </h2>
          <div className="mt-8 grid grid-cols-3 gap-6 max-md:grid-cols-1 max-md:gap-4">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-panel border border-border bg-surface p-6 text-left"
              >
                <p className="mb-4 text-sm italic leading-relaxed text-text-secondary">
                  {t.text}
                </p>
                <div className="text-[13px] font-semibold text-text-primary">{t.author}</div>
                <div className="text-xs text-text-muted">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
