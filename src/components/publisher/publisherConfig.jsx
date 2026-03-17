import { Linkedin, Instagram, MessageCircle } from "lucide-react";

export const PLATFORM_CONFIG = {
  linkedin: {
    label: "LinkedIn",
    Icon: Linkedin,
    color: "text-blue-700",
    bg: "bg-blue-50",
    maxChars: 3000,
    supportsImages: true,
    supportsVideo: true,
    supportsCarousel: false,
  },
  instagram: {
    label: "Instagram",
    Icon: Instagram,
    color: "text-pink-600",
    bg: "bg-pink-50",
    maxChars: 2200,
    supportsImages: true,
    supportsVideo: true,
    supportsCarousel: true,
  },
};

// Maximum number of connected channels per platform
export const MAX_CHANNELS_PER_TYPE = {
  linkedin: 3, // 1 personal + 2 business
  instagram: 2,
  threads: 2,
};

export const POST_STATUS_CONFIG = {
  draft: { label: "Draft", color: "text-slate-500", bg: "bg-slate-100" },
  scheduled: { label: "Scheduled", color: "text-indigo-600", bg: "bg-indigo-50" },
  publishing: { label: "Publishing...", color: "text-amber-600", bg: "bg-amber-50" },
  published: { label: "Published", color: "text-emerald-600", bg: "bg-emerald-50" },
  failed: { label: "Failed", color: "text-red-600", bg: "bg-red-50" },
  cancelled: { label: "Cancelled", color: "text-slate-400", bg: "bg-slate-50" },
};