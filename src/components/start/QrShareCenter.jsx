import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, ExternalLink, ScanLine, Share2, X } from 'lucide-react';
import { qrSrc } from '@/lib/publicCard';

const NAVY = '#1E3A5A';
const INK = '#16293F';
const CREAM = '#FAF8F5';
const SAND = '#EFE7DC';
const COPPER = '#B87333';
const GOLD = '#C9A87C';

const LABEL = 'font-body text-[8px] font-bold uppercase tracking-[0.24em]';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // An embedded browser or an insecure origin has no clipboard: copy by hand.
    try {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      field.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

// The badge, worn.
//
// A conference lanyard badge and the platform's share centre are the same object: the
// person opposite reads a name and a code, and the holder prints whatever the moment is
// about onto it. So the code is large enough to be scanned across a table, the stock is
// cream, the band navy, the trim copper — and the destination keys are the badge's own
// field printer. Nothing here needs the reader to have an account.
export default function QrShareCenter({
  holder = null,
  destinations = [],
  destination,
  onDestination,
  link,
  onClose,
  showWear = true,
}) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = useCallback(async () => {
    const ok = await copyText(link);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1800);
  }, [link]);

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: holder?.name || 'TOP 100 Aerospace & Aviation', url: link });
    } catch {
      /* the hand closed the sheet — nothing to report */
    }
    return undefined;
  };

  const selected = destinations.find((entry) => entry.key === destination) || destinations[0];

  return (
    <div
      className="hh-glass-panel fixed inset-0 z-[130] flex items-end justify-center md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Your badge and share code"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        style={{ background: 'rgba(6,12,21,0.72)' }}
      />

      <div
        className="hh-glass-panel-card relative w-full max-w-md overflow-y-auto scrollbar-hide rounded-t-[22px] md:rounded-[18px]"
        style={{
          background: CREAM,
          border: `1px solid ${COPPER}66`,
          boxShadow: '0 34px 80px -30px rgba(3,8,15,0.85), inset 0 0 0 1px rgba(255,255,255,0.5)',
        }}
      >
        {/* The clip: the slot the lanyard passes through, cut into the stock. */}
        <div className="flex flex-col items-center pt-3">
          <div
            className="h-[6px] w-11 rounded-full"
            style={{ background: 'rgba(6,12,21,0.55)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.65)' }}
          />
        </div>

        {/* The band: who is being met. */}
        <div
          className="mx-3 mt-2 rounded-[6px] px-4 py-3"
          style={{
            background: `linear-gradient(180deg, ${NAVY} 0%, ${INK} 100%)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 ${COPPER}66`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`${LABEL} text-[7px]`} style={{ color: GOLD }}>
                TOP 100 · Aerospace &amp; Aviation
              </p>
              <p className="mt-1 truncate font-heading text-[21px] leading-tight text-editorial-cream">
                {holder?.name || 'A Fellow'}
              </p>
              <p className="mt-0.5 truncate font-body text-[10px]" style={{ color: 'rgba(250,248,245,0.62)' }}>
                {[holder?.role, holder?.org].filter(Boolean).join(' · ') || 'A verified record'}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span
                className={`inline-block rounded-[3px] px-1.5 py-0.5 ${LABEL} text-[6.5px]`}
                style={{ color: INK, background: GOLD }}
              >
                {selected?.label || 'Share'}
              </span>
              <button
                type="button"
                autoFocus
                onClick={onClose}
                aria-label="Close"
                className="mt-2 flex h-7 w-7 items-center justify-center rounded-full"
                style={{ color: 'rgba(250,248,245,0.75)', border: '1px solid rgba(250,248,245,0.28)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* The code itself, printed on white so any camera reads it at arm's length. */}
        <div className="flex flex-col items-center px-4 pt-4">
          <div
            className="rounded-[10px] p-3"
            style={{ background: '#FFFFFF', border: `1px solid rgba(30,58,90,0.14)`, boxShadow: '0 10px 24px -18px rgba(3,8,15,0.8)' }}
          >
            <img
              src={qrSrc(link, 620)}
              alt={`Code for ${holder?.name || 'the platform'}`}
              className="h-[min(66vw,282px)] w-[min(66vw,282px)]"
            />
          </div>
          <p className={`mt-2 ${LABEL} text-[7px]`} style={{ color: 'rgba(30,58,90,0.55)' }}>
            Scan it — no app needed
          </p>
          <p className="mt-1 w-full truncate text-center font-body text-[9.5px] tabular-nums" style={{ color: 'rgba(30,58,90,0.62)' }}>
            {link}
          </p>
        </div>

        {/* The field printer: what this badge is about, right now. */}
        <div className="px-4 pt-4">
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${COPPER}, rgba(30,58,90,0.1))` }} />
          <p className={`mt-3 ${LABEL}`} style={{ color: 'rgb(var(--editorial-label-rgb))' }}>
            The code opens
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {destinations.map((entry) => {
              const active = entry.key === selected?.key;
              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => onDestination(entry.key)}
                  aria-pressed={active}
                  className="rounded-[5px] px-2.5 py-2 text-left transition-colors"
                  style={{
                    background: active ? NAVY : '#FFFFFF',
                    border: `1px solid ${active ? NAVY : 'rgba(30,58,90,0.2)'}`,
                    boxShadow: active ? '0 8px 18px -12px rgba(3,8,15,0.8)' : 'none',
                  }}
                >
                  <span
                    className="block font-body text-[9.5px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: active ? CREAM : NAVY }}
                  >
                    {entry.label}
                  </span>
                  <span
                    className="mt-0.5 block truncate font-body text-[8.5px]"
                    style={{ color: active ? 'rgba(250,248,245,0.62)' : 'rgba(30,58,90,0.55)' }}
                  >
                    {entry.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Handing it on the other ways: the link, the share sheet, or the page itself. */}
        <div className="flex items-center gap-2 px-4 pt-3">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full font-body text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{ background: '#FFFFFF', color: NAVY, border: '1px solid rgba(30,58,90,0.32)' }}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          {typeof navigator !== 'undefined' && navigator.share ? (
            <button
              type="button"
              onClick={share}
              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full font-body text-[9px] font-bold uppercase tracking-[0.16em]"
              style={{ background: COPPER, color: CREAM }}
            >
              <Share2 className="h-3 w-3" /> Share
            </button>
          ) : (
            <a
              href={link}
              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full font-body text-[9px] font-bold uppercase tracking-[0.16em]"
              style={{ background: COPPER, color: CREAM }}
            >
              <ExternalLink className="h-3 w-3" /> Open
            </a>
          )}
        </div>

        {/* The badge is the same object worn on the whole glass, where it turns over. */}
        {showWear ? (
          <div className="px-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/badge')}
              className="inline-flex min-h-[34px] w-full items-center justify-center gap-1.5 rounded-full font-body text-[9px] font-bold uppercase tracking-[0.16em]"
              style={{ background: '#FFFFFF', color: COPPER, border: `1px solid ${COPPER}66` }}
            >
              <ScanLine className="h-3 w-3" /> Wear the badge
            </button>
          </div>
        ) : null}

        <p className="px-5 pb-2 pt-3 text-center font-body text-[9px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.58)' }}>
          {selected?.key === 'card'
            ? 'They land on your card: save the contact, connect, or write to you. Saving needs no account.'
            : 'They land on the page you have chosen. The destination stays set until you change it.'}
        </p>

        {/* The perforated foot of a real badge. */}
        <div
          className="h-2 w-full"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(30,58,90,0.22) 1px, transparent 1.4px)',
            backgroundSize: '7px 7px',
          }}
          aria-hidden="true"
        />
        <div className="h-[6px] w-full" style={{ background: SAND }} aria-hidden="true" />
      </div>
    </div>
  );
}