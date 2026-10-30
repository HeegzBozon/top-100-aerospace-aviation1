import { useEffect, useState } from 'react';
import { Check, Copy, QrCode, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cardUrl, frontDoorUrl, qrSrc } from '@/lib/publicCard';

// The card code, standing in the corner of the title screen.
//
// A title screen is what a Fellow holds up when they meet someone: the code is their
// record, and the person opposite scans it. Signed in, the code is that Fellow's card;
// with no account behind the screen there is no card to hand over, so it opens the
// platform instead and the account stays the visitor's own choice.
export default function TitleCardQr({ user = null, variant = 'glass', className = '' }) {
  const [open, setOpen] = useState(false);
  const [nominee, setNominee] = useState(null);
  const [copied, setCopied] = useState(false);
  const signedIn = !!user?.email;

  useEffect(() => {
    if (!signedIn) {
      setNominee(null);
      return undefined;
    }
    let alive = true;
    base44.entities.Nominee
      .filter({ nominee_email: user.email }, { limit: 1 })
      .then((page) => {
        if (alive) setNominee(page?.items?.[0] || null);
      })
      .catch(() => {
        if (alive) setNominee(null);
      });
    return () => {
      alive = false;
    };
  }, [signedIn, user?.email]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const personal = !!nominee?.id;
  const link = personal ? cardUrl(nominee.id) : frontDoorUrl();
  const desk = variant === 'desk';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={personal ? 'Your card code' : 'The platform code'}
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${desk ? 'min-h-[34px]' : 'min-h-[30px]'}`}
        style={{
          background: 'rgba(9,18,30,0.44)',
          border: '1px solid rgb(var(--editorial-gold-rgb) / 0.5)',
        }}
      >
        <QrCode className={desk ? 'h-4 w-4' : 'h-3.5 w-3.5'} style={{ color: 'rgb(var(--editorial-gold-rgb))' }} />
        <span
          className={`font-body font-bold uppercase tracking-[0.18em] text-editorial-gold ${desk ? 'text-[8.5px]' : 'text-[7.5px]'}`}
        >
          {personal ? 'My card' : 'Scan'}
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto px-4 py-8"
          style={{ background: 'rgba(4,9,17,0.82)' }}
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={personal ? 'Your card code' : 'The platform code'}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[320px] rounded-xl p-4"
            style={{
              background: '#FBF7F0',
              border: '1px solid rgba(184,115,51,0.55)',
              boxShadow: '0 28px 60px rgba(3,8,15,0.62)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: '#B87333' }}>
                  {personal ? 'Your card' : 'The front door'}
                </p>
                <p className="mt-1 truncate font-heading text-[17px] leading-tight" style={{ color: '#1E3A5A' }}>
                  {personal ? nominee.name : 'TOP 100 Aerospace & Aviation'}
                </p>
                {personal ? (
                  <p className="mt-0.5 truncate font-body text-[10px]" style={{ color: 'rgba(30,58,90,0.6)' }}>
                    {[nominee.title, nominee.company].filter(Boolean).join(' · ') || 'A verified record'}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-full p-1.5"
                style={{ color: 'rgba(30,58,90,0.6)', border: '1px solid rgba(30,58,90,0.18)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div
              className="mt-3 flex items-center justify-center rounded-lg p-2"
              style={{ background: '#FFFFFF', border: '1px solid rgba(30,58,90,0.14)' }}
            >
              <img src={qrSrc(link, 240)} alt={personal ? `Code for ${nominee.name}'s card` : 'Code for the platform'} width={208} height={208} className="h-[208px] w-[208px]" />
            </div>

            <p className="mt-2 truncate font-body text-[9.5px] tabular-nums" style={{ color: 'rgba(30,58,90,0.62)' }}>
              {link}
            </p>

            <p className="mt-2 font-body text-[10.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.72)' }}>
              {personal
                ? 'They scan and land on your card: save the contact, connect, follow, or write to you. Saving needs no account — joining is theirs to choose.'
                : 'They scan and the platform opens: the edition, the record, and the way in. Making an account is theirs to choose.'}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={copy}
                className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-full font-body text-[9px] font-bold uppercase tracking-[0.16em]"
                style={{ background: '#FFFFFF', color: '#1E3A5A', border: '1px solid rgba(30,58,90,0.32)' }}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
              {personal ? (
                <a
                  href={link}
                  className="inline-flex min-h-[36px] flex-1 items-center justify-center rounded-full font-body text-[9px] font-bold uppercase tracking-[0.16em]"
                  style={{ background: '#B87333', color: '#FAF8F5' }}
                >
                  Open card
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}