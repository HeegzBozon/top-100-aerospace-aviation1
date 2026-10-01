import React, { useEffect, useRef, useState } from 'react';
import { Share2, Link2, Linkedin, Twitter, Facebook, Check } from 'lucide-react';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const COPPER = '#b87333';
const CREAM = '#faf8f5';

/**
 * Native-first social share control. Uses the Web Share API on supported
 * devices (mobile-first) and falls back to a small popover with copy-link
 * and the three platforms the Series is distributed on.
 *
 * Props:
 *  - title:   share text headline
 *  - summary: optional one-line summary prepended to the URL
 */
export default function ShareBar({ title, summary }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = summary ? `${summary} — ${title}` : title;
  const enc = encodeURIComponent;
  const linkProps = (href) => ({
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: () => setOpen(false),
  });

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      setOpen((v) => !v);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setOpen(true);
    }
  };

  const trigger = (
    <button
      type="button"
      onClick={canNative ? nativeShare : () => setOpen((v) => !v)}
      className="inline-flex items-center gap-2 rounded-full border px-5 h-11 text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
      style={{ borderColor: 'rgba(201,168,124,0.5)', color: GOLD, background: 'rgba(201,168,124,0.08)' }}
      aria-label="Share this post"
    >
      <Share2 className="w-4 h-4" />
      Share
    </button>
  );

  if (canNative && !open) {
    return <div ref={wrapRef} className="relative inline-block">{trigger}</div>;
  }

  return (
    <div ref={wrapRef} className="relative inline-block">
      {trigger}

      {open && (
        <div
          className="absolute right-0 mt-3 w-64 rounded-xl border shadow-xl z-50 overflow-hidden"
          style={{ background: CREAM, borderColor: 'rgba(30,58,90,0.16)' }}
          role="menu"
        >
          <a
            {...linkProps(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`)}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[rgba(30,58,90,0.05)] transition-colors"
            style={{ color: NAVY }}
            role="menuitem"
          >
            <Linkedin className="w-4 h-4" style={{ color: NAVY }} />
            Share on LinkedIn
          </a>
          <a
            {...linkProps(`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`)}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[rgba(30,58,90,0.05)] transition-colors"
            style={{ color: NAVY }}
            role="menuitem"
          >
            <Twitter className="w-4 h-4" style={{ color: NAVY }} />
            Share on X
          </a>
          <a
            {...linkProps(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`)}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[rgba(30,58,90,0.05)] transition-colors"
            style={{ color: NAVY }}
            role="menuitem"
          >
            <Facebook className="w-4 h-4" style={{ color: NAVY }} />
            Share on Facebook
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm border-t hover:bg-[rgba(30,58,90,0.05)] transition-colors"
            style={{ color: NAVY, borderColor: 'rgba(30,58,90,0.12)' }}
            role="menuitem"
          >
            {copied ? <Check className="w-4 h-4" style={{ color: COPPER }} /> : <Link2 className="w-4 h-4" style={{ color: NAVY }} />}
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}