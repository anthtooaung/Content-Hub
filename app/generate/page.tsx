'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Copy, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import AppLayout from '@/components/AppLayout';
import Toast, { useToast } from '@/components/Toast';

const platforms = [
  { id: 'TikTok', label: 'TikTok', color: 'bg-tiktok' },
  { id: 'Instagram', label: 'Instagram', color: 'bg-instagram' },
  { id: 'Facebook', label: 'Facebook', color: 'bg-facebook' },
];

const tones = ['Professional', 'Casual', 'Playful', 'Bold', 'Inspirational', 'Educational'];
const goals = ['Awareness', 'Engagement', 'Sales', 'Community Building', 'Brand Story'];

const statusMessages = [
  'Understanding your campaign...',
  'Crafting TikTok content...',
  'Crafting Instagram content...',
  'Crafting Facebook content...',
  'Polishing your posts...',
];

interface PlatformResult {
  platform: string;
  content: any;
  error?: string;
  status: 'pending' | 'loading' | 'done' | 'error';
}

export default function GeneratePage() {
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [editModal, setEditModal] = useState<{ open: boolean; platform: string; text: string }>({ open: false, platform: '', text: '' });
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [campaign, setCampaign] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TikTok', 'Instagram', 'Facebook']);
  const [tone, setTone] = useState('Professional');
  const [goal, setGoal] = useState('Awareness');

  // Loading state
  const [currentStatus, setCurrentStatus] = useState(0);
  const [progress, setProgress] = useState(0);

  // Results state
  const [results, setResults] = useState<PlatformResult[]>([]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const generateForPlatform = async (platform: string): Promise<PlatformResult> => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: businessName,
          platform,
          tone,
          topic: campaign,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      const content = await response.json();
      return { platform, content, status: 'done' };
    } catch (error) {
      return {
        platform,
        content: null,
        error: `${platform} generation failed. Please try again.`,
        status: 'error',
      };
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleGenerate = useCallback(async () => {
    setStep('loading');
    setCurrentStatus(0);
    setProgress(0);

    // Initialize results
    const initial: PlatformResult[] = selectedPlatforms.map((p) => ({
      platform: p,
      content: null,
      status: 'pending',
    }));
    setResults(initial);

    // Animate status messages
    const totalPlatforms = selectedPlatforms.length;
    const stepDuration = 1500;
    let msgIndex = 0;

    const statusInterval = setInterval(() => {
      msgIndex++;
      if (msgIndex < statusMessages.length) {
        setCurrentStatus(msgIndex);
        setProgress(Math.min(((msgIndex + 1) / statusMessages.length) * 100, 90));
      }
    }, stepDuration);

    // Generate all platforms in parallel
    const promises = selectedPlatforms.map((platform, i) => {
      // Stagger loading states
      setTimeout(() => {
        setResults((prev) =>
          prev.map((r) => (r.platform === platform ? { ...r, status: 'loading' } : r))
        );
      }, i * 300);

      return generateForPlatform(platform);
    });

    const generated = await Promise.all(promises);

    clearInterval(statusInterval);
    setProgress(100);
    setCurrentStatus(statusMessages.length - 1);

    // Short delay then show results
    setTimeout(() => {
      setResults(generated);
      setStep('results');
    }, 400);
  }, [businessName, campaign, selectedPlatforms, tone]);

  const handleRetry = async (platform: string) => {
    setResults((prev) =>
      prev.map((r) => (r.platform === platform ? { ...r, status: 'loading', error: undefined } : r))
    );

    const result = await generateForPlatform(platform);
    setResults((prev) => prev.map((r) => (r.platform === platform ? result : r)));
  };

  const handleNewGeneration = () => {
    setStep('form');
    setResults([]);
    setProgress(0);
    setCurrentStatus(0);
  };

  return (
    <AppLayout>
      <Toast message={toast.message} show={toast.show} onHide={hideToast} />

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" onClick={() => setEditModal({ ...editModal, open: false })}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-[600px] rounded-panel border border-border bg-surface shadow-modal animate-[modalIn_0.225s_ease]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h3 className="text-base font-semibold">Edit {editModal.platform} Post</h3>
              <button onClick={() => setEditModal({ ...editModal, open: false })} className="p-1 text-text-muted hover:text-text-primary transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={editModal.text}
                onChange={(e) => setEditModal({ ...editModal, text: e.target.value })}
                className="min-h-[160px] w-full resize-y rounded-control border border-border p-3.5 text-sm font-[inherit] leading-relaxed outline-none transition-shadow focus:border-primary focus:shadow-focus"
              />
              <div className="mt-2 text-right text-xs text-text-muted">{editModal.text.length}/280 characters</div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={() => setEditModal({ ...editModal, open: false })} className="rounded-control border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-subtle transition-all">Cancel</button>
              <button onClick={() => { setEditModal({ ...editModal, open: false }); showToast('Post updated!'); }} className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[720px] px-8 py-10 max-md:px-4 max-md:py-6 pb-24 md:pb-10">
        {/* Wizard Progress */}
        <div className="mb-8 flex items-center gap-3">
          {[
            { num: 1, label: 'Campaign details' },
            { num: 2, label: 'Generating' },
            { num: 3, label: 'Results' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-3 last:flex-0">
              <div
                className={clsx(
                  'flex items-center gap-2 text-sm',
                  step === 'form' && i === 0 && 'font-semibold text-primary',
                  step === 'loading' && i === 1 && 'font-semibold text-primary',
                  step === 'results' && i === 2 && 'font-semibold text-primary',
                  i > 0 && step === 'form' && 'text-text-disabled',
                  i > 1 && step === 'loading' && 'text-text-disabled',
                  i === 0 && step !== 'form' && 'text-success',
                  i === 1 && step === 'results' && 'text-success'
                )}
              >
                <div
                  className={clsx(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold',
                    step === 'form' && i === 0 && 'border-primary bg-primary-50 text-primary',
                    step === 'loading' && i === 1 && 'border-primary bg-primary-50 text-primary',
                    step === 'results' && i === 2 && 'border-primary bg-primary-50 text-primary',
                    i === 0 && step !== 'form' && 'border-success bg-success-soft text-success',
                    i === 1 && step === 'results' && 'border-success bg-success-soft text-success',
                    i > 0 && step === 'form' && 'border-border bg-surface text-text-disabled',
                    i > 1 && step === 'loading' && 'border-border bg-surface text-text-disabled'
                  )}
                >
                  {i === 0 && step !== 'form' ? '✓' : i === 1 && step === 'results' ? '✓' : s.num}
                </div>
                <span className="max-md:hidden">{s.label}</span>
              </div>
              {i < 2 && (
                <div
                  className={clsx(
                    'h-0.5 w-12',
                    (i === 0 && step !== 'form') || (i === 1 && step === 'results')
                      ? 'bg-success'
                      : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Form */}
        {step === 'form' && (
          <div className="rounded-panel border border-border bg-surface p-6 shadow-card">
            <h2 className="mb-6 text-[20px] font-semibold text-text-primary">
              Tell us about your campaign
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary">
                  Business or brand
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Bloom & Brew Coffee"
                  className="h-11 w-full rounded-control border border-border-strong px-3 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary">
                  What are you promoting?
                </label>
                <textarea
                  value={campaign}
                 onChange={(e) => setCampaign(e.target.value)}
                  placeholder="Describe your campaign, product, or event..."
                  rows={4}
                  className="min-h-[120px] w-full resize-y rounded-control border border-border-strong px-3 py-2.5 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary">
                  Platforms
                </label>
                <div className="flex gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={clsx(
                        'flex items-center gap-2 rounded-control border px-4 py-2 text-sm font-medium transition-all',
                        selectedPlatforms.includes(p.id)
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-border bg-surface text-text-secondary hover:border-border-strong'
                      )}
                    >
                      <div className={clsx('h-2 w-2 rounded-full', p.color)} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    Content goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="h-11 w-full rounded-control border border-border-strong px-3 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
                  >
                    {goals.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="h-11 w-full rounded-control border border-border-strong px-3 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
                  >
                    {tones.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!businessName || !campaign || selectedPlatforms.length === 0}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-control bg-primary text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-600 active:translate-y-0 active:bg-primary-700 disabled:pointer-events-none disabled:opacity-50"
            >
              <Sparkles size={18} />
              Generate {selectedPlatforms.length} post{selectedPlatforms.length !== 1 ? 's' : ''} →
            </button>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 'loading' && (
          <div className="relative rounded-panel border border-border bg-surface p-6 shadow-card">
            {/* Progress Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-panel bg-page/85">
              <div className="h-9 w-9 rounded-full border-[3px] border-border border-t-primary [animation:spin_0.8s_linear_infinite]" />
              <div className="text-sm text-text-secondary">
                {statusMessages[currentStatus]}
              </div>
              <div className="h-1.5 w-[200px] overflow-hidden rounded-[3px] border border-border">
                <div
                  className="h-full rounded-[3px] bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Skeleton cards behind overlay */}
            <div className="space-y-4 opacity-30">
              {selectedPlatforms.map((p) => (
                <div key={p} className="rounded-panel border border-border bg-surface p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-7 w-7 animate-pulse rounded-md bg-border" />
                    <div className="h-4 w-20 animate-pulse rounded bg-border" />
                  </div>
                  <div className="mb-2 h-3 w-[80%] animate-pulse rounded bg-border" />
                  <div className="mb-2 h-3 w-[60%] animate-pulse rounded bg-border" />
                  <div className="h-3 w-[40%] animate-pulse rounded bg-border" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-text-primary">Your content</h2>
              <button
                onClick={handleNewGeneration}
                className="rounded-control border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-border-strong hover:bg-surface-subtle"
              >
                + New generation
              </button>
            </div>

            <div className="space-y-4">
              {results.map((r, i) => (
                <ResultCard
                  key={r.platform}
                  result={r}
                  onRetry={() => handleRetry(r.platform)}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ResultCard({
  result,
  onRetry,
  index,
}: {
  result: PlatformResult;
  onRetry: () => void;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

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

  const copyAll = () => {
    if (!result.content) return;
    const text = `${result.content.post}\n\n${result.content.hashtags?.join(' ')}\n\n${result.content.caption}\n\n${result.content.callToAction}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result.status === 'loading') {
    return (
      <div className="rounded-panel border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-md bg-border" />
          <div className="h-4 w-20 animate-pulse rounded bg-border" />
        </div>
        <div className="mb-2 h-3 w-[80%] animate-pulse rounded bg-border" />
        <div className="mb-2 h-3 w-[60%] animate-pulse rounded bg-border" />
        <div className="h-3 w-[40%] animate-pulse rounded bg-border" />
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div className="rounded-panel border border-warning bg-warning-soft p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-warning">
          <AlertTriangle size={16} />
          {result.error}
        </div>
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-1.5 rounded-control border border-warning bg-surface px-3 py-1.5 text-[13px] font-medium text-warning transition-colors hover:bg-warning-soft"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-panel border border-border bg-surface p-4 border-t-[3px] transition-all duration-200',
        platformBorders[result.platform]
      )}
      style={{
        opacity: 0,
        transform: 'translateY(8px)',
        animation: `fadeSlideIn 0.3s ease forwards ${index * 0.1}s`,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold text-white',
              platformColors[result.platform]
            )}
          >
            {result.platform === 'TikTok' ? 'TT' : result.platform === 'Instagram' ? 'IG' : 'FB'}
          </div>
          <span className="text-sm font-semibold text-text-primary">{result.platform}</span>
        </div>
        <button
          onClick={copyAll}
          className="flex items-center gap-1.5 rounded-control border border-border px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-all hover:border-primary-border hover:bg-primary-50 hover:text-primary"
        >
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>

      <div className="mb-3 text-sm leading-relaxed text-text-primary">
        {result.content?.post}
      </div>

      {result.content?.hashtags?.length > 0 && (
        <div className="mb-2 text-[13px] text-primary">
          {result.content.hashtags.join(' ')}
        </div>
      )}

      {result.content?.caption && (
        <div className="mb-2 text-[13px] text-text-secondary">
          {result.content.caption}
        </div>
      )}

      {result.content?.callToAction && (
        <div className="text-[13px] font-semibold text-text-secondary">
          CTA: {result.content.callToAction}
        </div>
      )}
    </div>
  );
}
