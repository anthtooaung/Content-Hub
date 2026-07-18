'use client';

import { Fragment, Suspense, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Sparkles, Copy, Check, AlertTriangle, RefreshCw, Save, ChevronDown, ChevronUp, ImagePlus, X } from 'lucide-react';
import { clsx } from 'clsx';
import AppLayout from '@/components/AppLayout';
import Toast, { useToast } from '@/components/Toast';
import FacebookPostCard from '@/components/FacebookPostCard';
import TikTokPostCard from '@/components/TikTokPostCard';
import InstagramPostCard from '@/components/InstagramPostCard';
import { getGradeColor } from '@/lib/scoring';
import { getTemplateById } from '@/lib/templates';

const platforms = [
  { id: 'TikTok', label: 'TikTok', color: 'bg-tiktok' },
  { id: 'Instagram', label: 'Instagram', color: 'bg-instagram' },
  { id: 'Facebook', label: 'Facebook', color: 'bg-facebook' },
];

const emotions = [
  { id: 'joy', label: 'Joy', emoji: '😊' },
  { id: 'excitement', label: 'Excitement', emoji: '🔥' },
  { id: 'inspiration', label: 'Inspiration', emoji: '✨' },
];

const ageGroups = [
  { id: 'gen-alpha', label: 'Gen Alpha', range: '2013–2025' },
  { id: 'gen-z', label: 'Gen Z', range: '1997–2012' },
  { id: 'millennials', label: 'Millennials', range: '1981–1996' },
  { id: 'gen-x', label: 'Gen X', range: '1965–1980' },
  { id: 'boomers', label: 'Boomers', range: '1946–1964' },
  { id: 'all', label: 'All Ages', range: 'Everyone' },
];

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

interface UploadedImage {
  id: string;
  name: string;
  size: string;
  url: string;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="mx-auto max-w-[640px] px-8 py-10 max-md:px-4 max-md:py-6 pb-24 md:pb-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface-subtle rounded w-48" />
            <div className="h-64 bg-surface-subtle rounded-panel" />
          </div>
        </div>
      </AppLayout>
    }>
      <GenerateContent />
    </Suspense>
  );
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [editModal, setEditModal] = useState<{ open: boolean; platform: string; text: string }>({ open: false, platform: '', text: '' });
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [campaign, setCampaign] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TikTok', 'Instagram', 'Facebook']);
  const [emotion, setEmotion] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading state
  const [currentStatus, setCurrentStatus] = useState(0);
  const [progress, setProgress] = useState(0);

  // Results state
  const [results, setResults] = useState<PlatformResult[]>([]);

  // Ticket state
  const GENERATION_COST = 3;
  const [ticketBalance, setTicketBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch('/api/tickets')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTicketBalance(data.balance);
      })
      .catch(() => {});
  }, [session]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Pre-fill form from template if templateId is in URL
  useEffect(() => {
    const templateId = searchParams.get('templateId');
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setSelectedPlatforms([template.platform]);
        setCampaign(template.prompt);
      }
    }
  }, [searchParams]);

  const generateForPlatform = async (platform: string): Promise<PlatformResult> => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: businessName,
          platform,
          tone: 'Professional',
          emotion: emotion || undefined,
          ageGroup: ageGroup || undefined,
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
    // If guest user, redirect to login
    if (!session) {
      router.push('/auth/signin?callbackUrl=/generate');
      return;
    }

    // Pre-flight ticket spend — charged once per submit regardless of
    // how many platforms are selected (the actual generation fans out
    // into N parallel requests below, which can't safely coordinate
    // a shared decrement).
    try {
      const spendRes = await fetch('/api/tickets/spend', { method: 'POST' });
      const spendData = await spendRes.json();

      if (!spendRes.ok) {
        setTicketBalance(spendData.balance ?? 0);
        showToast(
          spendData.error === 'Not enough tickets'
            ? 'Not enough tickets — resets at midnight.'
            : 'Could not check ticket balance. Please try again.'
        );
        return;
      }

      setTicketBalance(spendData.balance);
    } catch {
      showToast('Could not check ticket balance. Please try again.');
      return;
    }

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
  }, [businessName, campaign, selectedPlatforms, emotion, ageGroup, session, router]);

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
    // Clear images and revoke URLs
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
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
              <button onClick={() => setEditModal({ ...editModal, open: false })} className="rounded-control border-2 border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]">Cancel</button>
              <button onClick={() => { setEditModal({ ...editModal, open: false }); showToast('Post updated!'); }} className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace: scrollable area */}
      <div className="min-h-[calc(100vh-64px)]">
        <div className="mx-auto max-w-[640px] px-8 py-8 max-md:px-4 max-md:py-6">
          {/* Wizard Progress */}
          <div className="mb-8 flex items-center w-full">
            {[
              { num: 1, label: 'Campaign details' },
              { num: 2, label: 'Generating' },
              { num: 3, label: 'Results' },
            ].map((s, i) => (
              <Fragment key={s.num}>
                <div
                  className={clsx(
                    'flex items-center gap-2 text-sm whitespace-nowrap',
                    step === 'form' && i === 0 && 'font-semibold text-primary',
                    i > 0 && step === 'form' && 'text-text-disabled',
                    i > 1 && step === 'loading' && 'text-text-disabled',
                    i === 0 && step !== 'form' && 'text-success',
                    i === 1 && (step === 'loading' || step === 'results') && 'font-semibold text-success',
                    i === 2 && step === 'results' && 'font-semibold text-success'
                  )}
                >
                  <div
                    className={clsx(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                      step === 'form' && i === 0 && 'border-primary bg-primary-50 text-primary',
                      i === 0 && step !== 'form' && 'border-success bg-success-soft text-success',
                      i === 1 && (step === 'loading' || step === 'results') && 'border-success bg-success-soft text-success',
                      i === 2 && step === 'results' && 'border-success bg-success-soft text-success',
                      i > 0 && step === 'form' && 'border-border bg-surface text-text-disabled',
                      i > 1 && step === 'loading' && 'border-border bg-surface text-text-disabled'
                    )}
                  >
                    {(i === 0 && step !== 'form') ||
                    (i === 1 && (step === 'loading' || step === 'results')) ||
                    (i === 2 && step === 'results')
                      ? '✓'
                      : s.num}
                  </div>
                  <span className="max-md:hidden">{s.label}</span>
                </div>
                {i < 2 && (
                  <div
                    className={clsx(
                      'h-0.5 flex-1 min-w-[20px] mx-2',
                      (i === 0 && step !== 'form') || (i === 1 && step === 'results')
                        ? 'bg-success'
                        : 'bg-border'
                    )}
                  />
                )}
              </Fragment>
            ))}
          </div>

          {/* Step 1: Form — Centered Card */}
          {step === 'form' && (
            <div>
              <div className="rounded-panel border border-border bg-surface p-8 shadow-card max-md:p-6">
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                    <Sparkles size={22} className="text-primary" />
                  </div>
                  <h2 className="mb-1.5 text-[20px] font-semibold text-text-primary">
                    Create your content
                  </h2>
                  <p className="text-[14px] text-text-muted">
                    Tell us about your brand and what you want to promote
                  </p>
                </div>

                {/* Section: About */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">About</div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                        Business or brand
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Bloom & Brew Coffee"
                        className="h-11 w-full rounded-control border border-border-strong px-3.5 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                        What are you promoting?
                      </label>
                      <textarea
                        value={campaign}
                        onChange={(e) => setCampaign(e.target.value)}
                        placeholder="Describe your campaign, product, or event..."
                        rows={3}
                        className="min-h-[88px] w-full resize-y rounded-control border border-border-strong px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Media */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Media</div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-control border border-dashed border-border-strong bg-surface-subtle py-6 text-[13px] font-medium text-text-secondary transition-all duration-150 hover:border-primary hover:bg-primary-50 hover:text-primary"
                  >
                    <ImagePlus size={18} />
                    Add images — product photos, promo graphics, etc.
                  </button>
                  {images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {images.map((img) => (
                        <div key={img.id} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                          <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section: Audience */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Audience</div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-4">
                    {/* Emotion */}
                    <div>
                      <label className="mb-2 block text-[13px] font-semibold text-text-primary">
                        Emotional tone
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {emotions.map((e) => (
                          <button
                            key={e.id}
                            onClick={() => setEmotion(emotion === e.id ? '' : e.id)}
                            className={clsx(
                              'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all duration-150',
                              emotion === e.id
                                ? 'border-primary bg-primary-50 text-primary shadow-[0_0_0_2px_rgba(37,99,235,0.12)]'
                                : 'border-gray-200 bg-surface text-text-secondary hover:border-text-disabled hover:bg-surface-subtle'
                            )}
                          >
                            <span className="text-base">{e.emoji}</span>
                            <span>{e.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Age Group */}
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                        Target age group
                      </label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="h-11 w-full rounded-control border border-border-strong px-3.5 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
                      >
                        <option value="">Any age</option>
                        {ageGroups.map((ag) => (
                          <option key={ag.id} value={ag.id}>{ag.label} — {ag.range}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Platforms */}
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Platforms</div>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="flex gap-2">
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={clsx(
                          'flex flex-1 items-center justify-center gap-2 rounded-control border px-4 py-3 text-sm font-medium transition-colors duration-150',
                          selectedPlatforms.includes(p.id)
                            ? 'border-primary bg-primary-50 text-primary'
                            : 'border-gray-200 bg-surface text-text-secondary hover:border-border-strong'
                        )}
                      >
                        <div className={clsx('h-2.5 w-2.5 rounded-full', p.color)} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={
                    !businessName ||
                    !campaign ||
                    selectedPlatforms.length === 0 ||
                    (session != null && ticketBalance !== null && ticketBalance < GENERATION_COST)
                  }
                  className="flex h-12 w-full items-center justify-center gap-2.5 rounded-control bg-primary text-[15px] font-semibold text-white transition-all duration-150 hover:bg-primary-600 hover:shadow-[0_4px_16px_rgba(37,99,235,0.3)] active:bg-primary-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Sparkles size={18} />
                  {session
                    ? `Generate ${selectedPlatforms.length} post${selectedPlatforms.length !== 1 ? 's' : ''}`
                    : 'Sign in to generate'}
                </button>
                {session && ticketBalance !== null && (
                  <div className="text-center text-xs text-text-muted">
                    Costs {GENERATION_COST} tickets · You have {ticketBalance} ticket{ticketBalance !== 1 ? 's' : ''}
                    {ticketBalance < GENERATION_COST && (
                      <span className="text-error"> — not enough to generate, resets at midnight</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 'loading' && (
            <div className="relative rounded-panel border border-border bg-surface p-6 shadow-card">
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
                  className="rounded-control border-2 border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                >
                  + New generation
                </button>
              </div>

              <div className="space-y-4">
                {results.map((r, i) => {
                  if (r.status === 'loading') {
                    return (
                      <div key={r.platform} className="rounded-panel border border-border bg-surface overflow-hidden">
                        <div className="h-20 bg-surface-subtle animate-pulse" />
                        <div className="p-5">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="h-4 w-4 animate-pulse rounded bg-border" />
                            <div className="h-4 w-24 animate-pulse rounded bg-border" />
                          </div>
                          <div className="mb-2 h-3 w-[85%] animate-pulse rounded bg-border" />
                          <div className="mb-2 h-3 w-[65%] animate-pulse rounded bg-border" />
                          <div className="h-3 w-[45%] animate-pulse rounded bg-border" />
                        </div>
                      </div>
                    );
                  }
                  if (r.status === 'error') {
                    return (
                      <div key={r.platform} className="rounded-panel border border-warning bg-warning-soft p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm text-warning">
                          <AlertTriangle size={16} />
                          {r.error}
                        </div>
                        <button
                          onClick={() => handleRetry(r.platform)}
                          className="mt-2 flex items-center gap-1.5 rounded-control border border-warning bg-surface px-3 py-1.5 text-[13px] font-medium text-warning transition-colors duration-150 hover:bg-warning-soft"
                        >
                          <RefreshCw size={14} />
                          Retry
                        </button>
                      </div>
                    );
                  }
                  if (r.platform === 'Facebook') {
                    return <FacebookPostCard key={r.platform} content={r.content} images={images} index={i} />;
                  }
                  if (r.platform === 'TikTok') {
                    return <TikTokPostCard key={r.platform} content={r.content} images={images} index={i} />;
                  }
                  if (r.platform === 'Instagram') {
                    return <InstagramPostCard key={r.platform} content={r.content} images={images} index={i} />;
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const platformStyles: Record<string, { header: string; icon: string; accent: string }> = {
    TikTok: {
      header: 'bg-gradient-to-r from-[#010101] to-[#1a1a2e]',
      icon: 'bg-[#00F2EA]',
      accent: 'text-[#00F2EA]',
    },
    Instagram: {
      header: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]',
      icon: 'bg-white/20',
      accent: 'text-instagram',
    },
    Facebook: {
      header: 'bg-gradient-to-r from-[#1877F2] to-[#0d5bbd]',
      icon: 'bg-white/20',
      accent: 'text-facebook',
    },
  };

  const style = platformStyles[result.platform] || platformStyles.Facebook;

  const copyAll = () => {
    if (!result.content) return;
    const text = `${result.content.post}\n\n${result.content.hashtags?.join(' ')}\n\n${result.content.caption}\n\n${result.content.callToAction}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: result.platform,
          post: result.content.post,
          hashtags: result.content.hashtags,
          caption: result.content.caption,
          callToAction: result.content.callToAction,
        }),
      });
      if (response.ok) {
        setSaved(true);
      } else {
        console.error('Failed to save content');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (result.status === 'loading') {
    return (
      <div className="rounded-panel border border-border bg-surface overflow-hidden">
        <div className="h-20 bg-surface-subtle animate-pulse" />
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-border" />
            <div className="h-4 w-24 animate-pulse rounded bg-border" />
          </div>
          <div className="mb-2 h-3 w-[85%] animate-pulse rounded bg-border" />
          <div className="mb-2 h-3 w-[65%] animate-pulse rounded bg-border" />
          <div className="h-3 w-[45%] animate-pulse rounded bg-border" />
        </div>
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
          className="mt-2 flex items-center gap-1.5 rounded-control border border-warning bg-surface px-3 py-1.5 text-[13px] font-medium text-warning transition-colors duration-150 hover:bg-warning-soft"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-panel border border-border bg-surface overflow-hidden transition-colors duration-200"
      style={{
        opacity: 0,
        transform: 'translateY(8px)',
        animation: `fadeSlideIn 0.3s ease forwards ${index * 0.1}s`,
      }}
    >
      {/* Platform-specific header */}
      <div className={clsx('relative flex items-center gap-3 px-5 py-4', style.header)}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-white/30" />
          <div className="absolute right-10 bottom-1 h-6 w-6 rounded-sm border border-white/20 rotate-12" />
        </div>

        <div className={clsx('relative flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-bold text-white', style.icon)}>
          {result.platform === 'TikTok' ? 'TT' : result.platform === 'Instagram' ? 'IG' : 'FB'}
        </div>
        <div className="relative flex-1">
          <span className="text-[15px] font-semibold text-white">{result.platform}</span>
          <span className="ml-2 text-[12px] text-white/60">Generated content</span>
        </div>

        {/* Action buttons in header */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 rounded-control bg-white/15 backdrop-blur-sm px-3 py-1.5 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-white/25"
          >
            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={clsx(
              'flex items-center gap-1.5 rounded-control px-3 py-1.5 text-[13px] font-medium transition-colors duration-150',
              saved
                ? 'bg-white/20 text-white'
                : 'bg-white text-text-primary hover:bg-white/90'
            )}
          >
            {saving ? 'Saving...' : saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
          </button>
        </div>
      </div>

      {/* Content body */}
      <div className="p-5">
        <div className="mb-4 text-[14px] leading-relaxed text-text-primary whitespace-pre-wrap">
          {result.content?.post}
        </div>

        {result.content?.hashtags?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {result.content.hashtags.map((tag: string, i: number) => (
              <span
                key={i}
                className={clsx(
                  'rounded-full bg-primary-50 px-2.5 py-0.5 text-[12px] font-medium',
                  style.accent
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {result.content?.caption && (
          <div className="mb-3 rounded-control bg-surface-subtle p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Caption</div>
            <p className="text-[13px] leading-relaxed text-text-secondary">{result.content.caption}</p>
          </div>
        )}

        {result.content?.callToAction && (
          <div className="mb-3 flex items-center gap-2 rounded-control bg-primary-50 px-3 py-2">
            <span className="text-[12px] font-semibold text-primary">CTA:</span>
            <span className="text-[13px] font-medium text-text-primary">{result.content.callToAction}</span>
          </div>
        )}
      </div>

      {/* Content Score */}
      {result.content?.score && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">Score:</span>
                <span className="text-lg font-bold text-text-primary">
                  {result.content.score.overall}/100
                </span>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    getGradeColor(result.content.score.grade)
                  )}
                >
                  {result.content.score.grade}
                </span>
              </div>
              <button
                onClick={() => setShowScoreDetails(!showScoreDetails)}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                {showScoreDetails ? (
                  <>
                    <ChevronUp size={14} />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    View breakdown
                  </>
                )}
              </button>
            </div>

            {/* Score Breakdown */}
            {showScoreDetails && (
              <div className="mt-3 space-y-2">
                <ScoreBar label="Readability" score={result.content.score.readability} />
                <ScoreBar label="Hashtag Relevance" score={result.content.score.hashtagRelevance} />
                <ScoreBar label="CTA Strength" score={result.content.score.ctaStrength} />

                {/* Suggestions */}
                {result.content.score.suggestions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-text-muted mb-2">Suggestions:</p>
                    <ul className="space-y-1">
                      {result.content.score.suggestions.map((suggestion: string, i: number) => (
                        <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-muted w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-subtle rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', getBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-text-primary w-8 text-right">
        {score}
      </span>
    </div>
  );
}
