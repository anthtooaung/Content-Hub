'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { getGradeColor } from '@/lib/scoring';
import {
  Copy,
  Check,
  Save,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ImagePlus,
  Music,
} from 'lucide-react';

interface TikTokPostCardProps {
  content: any;
  images?: { id: string; name: string; url: string }[];
  onRetry?: () => void;
  index?: number;
}

export default function TikTokPostCard({
  content,
  images = [],
  onRetry,
  index = 0,
}: TikTokPostCardProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const copyAll = () => {
    if (!content) return;
    const text = `${content.post}\n\n${content.hashtags?.join(' ')}\n\n${content.caption}\n\n${content.callToAction}`;
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
          platform: 'TikTok',
          post: content.post,
          hashtags: content.hashtags,
          caption: content.caption,
          callToAction: content.callToAction,
        }),
      });
      if (response.ok) setSaved(true);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="overflow-hidden rounded-xl bg-[#161823]"
      style={{
        opacity: 0,
        transform: 'translateY(8px)',
        animation: `fadeSlideIn 0.3s ease forwards ${index * 0.1}s`,
      }}
    >
      {/* Generated badge */}
      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-md bg-[rgba(37,99,235,0.9)] px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21" />
        </svg>
        Content Hub
      </div>

      {/* Video / Image area */}
      <div className="relative" style={{ aspectRatio: '9/16', maxHeight: '500px' }}>
        {images.length > 0 ? (
          <img
            src={images[0].url}
            alt={images[0].name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1E1E2E] to-[#2D1B4E]">
            <ImagePlus size={48} className="opacity-40 text-white" />
            <span className="text-[13px] text-white/60">Add a video thumbnail or image</span>
            <span className="text-[11px] text-white/30">Tap to upload</span>
          </div>
        )}

        {/* Right sidebar */}
        <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
          {/* Profile */}
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#FE2C55] to-[#FF6B6B] text-[18px] font-bold text-white">
              B
            </div>
            <div className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-[#FE2C55] text-[14px] font-bold text-white">
              +
            </div>
          </div>

          {/* Like */}
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-all hover:scale-110 hover:bg-white/20">
              <Heart size={24} className="fill-[#FE2C55] text-[#FE2C55]" />
            </div>
            <span className="text-[12px] font-medium text-white">45.2K</span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-all hover:scale-110 hover:bg-white/20">
              <MessageCircle size={24} className="text-white" />
            </div>
            <span className="text-[12px] font-medium text-white">1,832</span>
          </div>

          {/* Bookmark */}
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-all hover:scale-110 hover:bg-white/20">
              <Bookmark size={24} className="text-white" />
            </div>
            <span className="text-[12px] font-medium text-white">12.1K</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-all hover:scale-110 hover:bg-white/20">
              <Share2 size={24} className="text-white" />
            </div>
            <span className="text-[12px] font-medium text-white">3,421</span>
          </div>
        </div>

        {/* Sound disc */}
        <div className="absolute right-3 bottom-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-[#161823] [animation:spin_3s_linear_infinite]">
          <div className="h-[18px] w-[18px] rounded-full bg-gradient-to-br from-[#FE2C55] to-[#FF6B6B]" />
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-16">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="text-[16px] font-bold text-white">bloomandbrew</span>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#25F4EE]">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#161823" strokeWidth="3">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </span>
          </div>
          <div className="mb-2 max-h-20 overflow-hidden text-[14px] leading-[1.5] text-white/90">
            {content?.post}
          </div>
          {content?.hashtags?.length > 0 && (
            <div className="mb-2 text-[14px] text-white">
              {content.hashtags.join(' ')}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[13px] text-white/80">
            <Music size={14} />
            <span>Original Sound — bloomandbrew</span>
          </div>
        </div>
      </div>

      {/* Copy / Save / Score controls below the card */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-white/20"
          >
            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              saved
                ? 'bg-white/20 text-white'
                : 'bg-white text-[#161823] hover:bg-white/90'
            )}
          >
            {saving ? 'Saving...' : saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
          </button>
        </div>

        {/* Score */}
        {content?.score && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-white">Score:</span>
                <span className="text-[18px] font-bold text-white">{content.score.overall}/100</span>
                <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-bold', getGradeColor(content.score.grade))}>
                  {content.score.grade}
                </span>
              </div>
              <button
                onClick={() => setShowScoreDetails(!showScoreDetails)}
                className="flex items-center gap-1 text-[12px] text-white/60 hover:text-white transition-colors"
              >
                {showScoreDetails ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> Details</>}
              </button>
            </div>
            {showScoreDetails && (
              <div className="mt-3 space-y-2">
                <ScoreBar label="Readability" score={content.score.readability} />
                <ScoreBar label="Hashtag Relevance" score={content.score.hashtagRelevance} />
                <ScoreBar label="CTA Strength" score={content.score.ctaStrength} />
                {content.score.suggestions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[11px] font-medium text-white/60 mb-2">Suggestions:</p>
                    <ul className="space-y-1">
                      {content.score.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-[11px] text-white/60 flex items-start gap-1.5">
                          <span className="text-[#25F4EE] mt-0.5">•</span>
                          {s}
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
      <span className="text-[11px] text-white/60 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', getBarColor(score))} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[11px] font-medium text-white w-6 text-right">{score}</span>
    </div>
  );
}
