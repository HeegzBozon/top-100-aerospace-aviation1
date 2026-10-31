import { useState } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAVY = '#1e3a5a';
const CREAM = '#faf8f5';
const COPPER = '#b87333';
const GOLD = '#c9a87c';

// The Gift Shop's list. The collection is not open yet, so the shop asks for the one
// thing it can use: an address. The signup is recorded on the publication waitlist under
// the shop's own key, so it exports with every other list the house keeps, and the
// newsletter is filed once beside it — best-effort, because a CRM hiccup must never cost
// someone the entry they just made.
export default function GiftShopWaitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      setError('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      await base44.entities.PublicationWaitlist.create({
        email: trimmed,
        publication: 'gift_shop',
        surface: 'gift_shop',
      });
      base44.functions.invoke('subscribeNewsletter', { email: trimmed, source: 'gift_shop' }).catch(() => {});
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setError('We could not save your address. Please try again.');
    }
  };

  return (
    <section className="px-5 py-10 md:px-16 md:py-14" style={{ background: CREAM }}>
      <div className="mx-auto max-w-3xl border-t-2 pt-8" style={{ borderColor: COPPER }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: COPPER }}>
          The Gift Shop &middot; Opening list
        </p>
        <h2 className="mt-2 font-heading text-[24px] leading-tight md:text-4xl" style={{ color: NAVY }}>
          Leave your address, and we&apos;ll tell you the day it opens.
        </h2>
        <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed md:text-sm" style={{ color: `${NAVY}cc` }}>
          The collection is being printed. The list is for the opening, the drops, and nothing else.
        </p>

        {status === 'success' ? (
          <div className="mt-5 flex items-center gap-2.5" role="status">
            <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: COPPER }} />
            <p className="text-[12.5px]" style={{ color: NAVY }}>
              You&apos;re on the list. We&apos;ll write once, when it opens.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 flex w-full max-w-md flex-col gap-2.5 sm:flex-row" noValidate>
            <div className="relative flex-1">
              <label htmlFor="gift-shop-email" className="sr-only">
                Email for the Gift Shop opening list
              </label>
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: `${NAVY}66` }}
              />
              <input
                id="gift-shop-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setError('');
                  }
                }}
                placeholder="you@organisation.com"
                aria-invalid={status === 'error'}
                aria-describedby={status === 'error' ? 'gift-shop-error' : undefined}
                className="w-full rounded-[3px] border bg-white py-3 pl-9 pr-3 text-[13px] outline-none"
                style={{ borderColor: `${NAVY}33`, color: NAVY }}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.2em] transition-opacity disabled:opacity-60"
              style={{ background: NAVY, color: CREAM }}
            >
              {status === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Join the list
            </button>
          </form>
        )}

        {status === 'error' && error ? (
          <p id="gift-shop-error" role="alert" className="mt-2 text-[11.5px]" style={{ color: '#a33' }}>
            {error}
          </p>
        ) : null}

        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: `${NAVY}66` }}>
          One letter. No list rented, no list sold.
        </p>
      </div>
    </section>
  );
}