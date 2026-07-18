"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { getGradeColor } from "@/lib/scoring";
import {
  Copy,
  Check,
  Save,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  ImagePlus,
} from "lucide-react";

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
    const text = `${content.post}\n\n${content.hashtags?.join(" ")}\n\n${content.caption}\n\n${content.callToAction}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "TikTok",
          post: content.post,
          hashtags: content.hashtags,
          caption: content.caption,
          callToAction: content.callToAction,
        }),
      });
      if (response.ok) setSaved(true);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatCaption = (text: string) => {
    if (!text) return null;
    return text.split(/(#\w+)/g).map((part, i) =>
      part.startsWith("#") ? (
        <span
          key={i}
          className="text-[#00376B] font-medium cursor-pointer hover:underline">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  return (
    <div
      className="overflow-hidden rounded-lg border border-[#DBDBDB] bg-white"
      style={{
        opacity: 0,
        transform: "translateY(8px)",
        animation: `fadeSlideIn 0.3s ease forwards ${index * 0.1}s`,
      }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="rounded-full p-[2px] bg-gradient-to-tr from-[#25F4EE] via-[#FE2C55] to-[#FE2C55]">
          <div className="rounded-full bg-white p-[2px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FE2C55] to-[#FF6B6B] text-[13px] font-bold text-white">
              B
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-[14px] font-semibold leading-tight">
            bloomandbrew
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#25F4EE]">
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#161823"
                strokeWidth="3">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </span>
          </div>
          <div className="text-[12px] text-[#8E8E8E] leading-tight">
            Bloom & Brew Coffee
          </div>
        </div>
        <button className="text-[#262626]">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Image area */}
      {images.length > 0 ? (
        <img
          src={images[0].url}
          alt={images[0].name}
          className="w-full cursor-pointer object-cover"
          style={{ aspectRatio: "1/0.7" }}
        />
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-2 bg-[#161823]"
          style={{ aspectRatio: "1/0.7" }}>
          <ImagePlus size={40} className="opacity-40 text-white" />
          <span className="text-[13px] font-medium text-white/60">
            Add a video thumbnail or image
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center px-3 py-2 gap-3">
        <button className="text-[#262626] transition-opacity hover:opacity-60">
          <Heart size={24} />
        </button>
        <button className="text-[#262626] transition-opacity hover:opacity-60">
          <MessageCircle size={24} />
        </button>
        <div className="flex-1" />
        <button className="text-[#262626] transition-opacity hover:opacity-60">
          <Bookmark size={24} />
        </button>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1 text-[14px] font-semibold">45.2K likes</div>

      {/* Caption */}
      <div className="px-3 pb-1 text-[14px] leading-[1.5]">
        <span className="font-semibold">bloomandbrew</span>{" "}
        {formatCaption(content?.post)}
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-2 text-[10px] uppercase tracking-wide text-[#8E8E8E]">
        2 hours ago
      </div>

      {/* Copy / Save / Score */}
      <div className="border-t border-[#DBDBDB] px-3 py-3">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 rounded-lg border-2 border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-[13px] font-semibold text-primary transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
            {copied ? (
              <>
                <Check size={14} /> Copied
              </>
            ) : (
              <>
                <Copy size={14} /> Copy
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
              saved
                ? "border-[#15803D] bg-[#F0FDF4] text-[#15803D]"
                : "border-[#BFDBFE] bg-[#EFF6FF] text-primary hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]",
            )}>
            {saving ? (
              "Saving..."
            ) : saved ? (
              <>
                <Check size={14} /> Saved
              </>
            ) : (
              <>
                <Save size={14} /> Save
              </>
            )}
          </button>
        </div>

        {content?.score && (
          <div className="mt-3 pt-3 border-t border-[#DBDBDB]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#262626]">
                  Score:
                </span>
                <span className="text-[18px] font-bold text-[#262626]">
                  {content.score.overall}/100
                </span>
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    getGradeColor(content.score.grade),
                  )}>
                  {content.score.grade}
                </span>
              </div>
              <button
                onClick={() => setShowScoreDetails(!showScoreDetails)}
                className="flex items-center gap-1 text-[12px] text-[#8E8E8E] hover:text-[#262626] transition-colors">
                {showScoreDetails ? (
                  <>
                    <ChevronUp size={14} /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} /> Details
                  </>
                )}
              </button>
            </div>
            {showScoreDetails && (
              <div className="mt-3 space-y-2">
                <ScoreBar
                  label="Readability"
                  score={content.score.readability}
                />
                <ScoreBar
                  label="Hashtag Relevance"
                  score={content.score.hashtagRelevance}
                />
                <ScoreBar
                  label="CTA Strength"
                  score={content.score.ctaStrength}
                />
                {content.score.suggestions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#DBDBDB]">
                    <p className="text-[11px] font-medium text-[#8E8E8E] mb-2">
                      Suggestions:
                    </p>
                    <ul className="space-y-1">
                      {content.score.suggestions.map((s: string, i: number) => (
                        <li
                          key={i}
                          className="text-[11px] text-[#8E8E8E] flex items-start gap-1.5">
                          <span className="text-[#FE2C55] mt-0.5">•</span>
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
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#8E8E8E] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            getBarColor(score),
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] font-medium text-[#262626] w-6 text-right">
        {score}
      </span>
    </div>
  );
}
