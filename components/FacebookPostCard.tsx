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
  ImagePlus,
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
} from "lucide-react";

interface FacebookPostCardProps {
  content: any;
  images?: { id: string; name: string; url: string }[];
  onRetry?: () => void;
  index?: number;
}

export default function FacebookPostCard({
  content,
  images = [],
  onRetry,
  index = 0,
}: FacebookPostCardProps) {
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
          platform: "Facebook",
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

  // Format post text with hashtags as blue
  const formatPostText = (text: string) => {
    if (!text) return null;
    return text.split(/(#\w+)/g).map((part, i) =>
      part.startsWith("#") ? (
        <span
          key={i}
          className="text-[#1877F2] font-medium cursor-pointer hover:underline">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  return (
    <div
      className="overflow-hidden rounded-lg border border-[#CED0D4] bg-white shadow-sm"
      style={{
        opacity: 0,
        transform: "translateY(8px)",
        animation: `fadeSlideIn 0.3s ease forwards ${index * 0.1}s`,
      }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#4A90D9] to-[#2563EB] text-[16px] font-bold text-white">
          B
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold text-[#050505] leading-tight hover:underline cursor-pointer">
            Bloom & Brew Coffee
          </div>
          <div className="flex items-center gap-1 text-[13px] text-[#65676B] leading-tight">
            <span>Just now</span>
            <span>·</span>
            <Globe size={12} className="opacity-60" />
          </div>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#65676B] transition-colors hover:bg-[#F2F2F2]">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post text */}
      <div className="whitespace-pre-wrap px-4 pb-3 text-[15px] leading-[1.5] text-[#050505]">
        {formatPostText(content?.post)}
      </div>

      {/* Image area */}
      {images.length > 0 ? (
        <img
          src={images[0].url}
          alt={images[0].name}
          className="w-full cursor-pointer object-cover"
          style={{ aspectRatio: "2/0.8" }}
        />
      ) : (
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-2 bg-[#F0F2F5]"
          style={{ aspectRatio: "2/0.8" }}>
          <ImagePlus size={48} className="opacity-40 text-[#65676B]" />
          <span className="text-[14px] font-medium text-[#65676B]">
            Add an image to this post
          </span>
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center justify-between px-4 py-2.5 text-[15px] text-[#65676B]">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877F2] text-[12px]">
              👍
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F33E58] text-[12px]">
              ❤️
            </span>
          </div>
          <span className="ml-1">1.2K</span>
        </div>
        <div className="flex gap-3">
          <span className="cursor-pointer hover:underline">342 Comments</span>
          <span className="cursor-pointer hover:underline">89 Shares</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mx-4 flex border-t border-b border-[#E4E6EB] py-1">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Share2, label: "Share" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex flex-1 items-center justify-center gap-2 py-2 text-[15px] font-semibold text-[#65676B] transition-colors hover:rounded-md hover:bg-[#F2F2F2]">
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>

      {/* Copy / Save / Score */}
      <div className="border-t border-[#E4E6EB] px-4 py-3">
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

        {/* Score */}
        {content?.score && (
          <div className="mt-3 pt-3 border-t border-[#E4E6EB]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#050505]">
                  Score:
                </span>
                <span className="text-[18px] font-bold text-[#050505]">
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
                className="flex items-center gap-1 text-[12px] text-[#65676B] hover:text-[#050505] transition-colors">
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
                  <div className="mt-3 pt-3 border-t border-[#E4E6EB]">
                    <p className="text-[11px] font-medium text-[#65676B] mb-2">
                      Suggestions:
                    </p>
                    <ul className="space-y-1">
                      {content.score.suggestions.map((s: string, i: number) => (
                        <li
                          key={i}
                          className="text-[11px] text-[#65676B] flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
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
      <span className="text-[11px] text-[#65676B] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            getBarColor(score),
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] font-medium text-[#050505] w-6 text-right">
        {score}
      </span>
    </div>
  );
}
