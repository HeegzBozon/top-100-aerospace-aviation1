import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReferralAnswered from '@/components/conferences/referrals/ReferralAnswered';

// Public response page for one referral: who, why, and two answers. No sign-up.
export default function ReferralRespond() {
  const token = new URLSearchParams(window.location.search).get('t') || '';
  const [view, setView] = useState(null);
  const [state, setState] = useState('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    base44.functions.invoke('respondToReferral', { token })
      .then(({ data }) => { setView(data); setState('ready'); })
      .catch((e) => setState(e.response?.status === 404 ? 'missing' : 'error'));
    return () => meta.remove();
  }, [token]);

  const answer = async (a) => {
    setBusy(true);
    const res = await base44.functions.invoke('respondToReferral', { token, answer: a }).catch(() => null);
    setBusy(false);
    if (res?.data) setView(res.data); else setState('error');
  };

  const shell = (children) => (
    <main className="flex min-h-screen items-center justify-center bg-editorial-navy px-5 py-10">
      <div className="w-full max-w-md rounded-lg border border-editorial-gold/30 bg-editorial-cream p-6 text-editorial-navy shadow-xl">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-editorial-label">TOP 100 Aerospace & Aviation · Introduction</p>
        <div className="mt-2 h-0.5 w-10 bg-editorial-copper" />
        {children}
      </div>
    </main>
  );

  if (state === 'loading') return shell(<Loader2 className="mx-auto mt-8 h-6 w-6 animate-spin text-editorial-copper" />);
  if (state === 'missing') return shell(<p className="mt-5 font-heading text-xl">This link isn't valid. Check the email it came in, or reply to the person who sent it.</p>);
  if (state === 'error') return shell(<p className="mt-5 font-heading text-xl">Something went wrong. Please try the link again in a moment.</p>);
  if (view.answered) return shell(<ReferralAnswered view={view} />);
  if (view.expired) return shell(<p className="mt-5 font-heading text-xl">This link has expired. Reply to {view.referrer_name}'s email and they'll take it from there.</p>);

  return shell(
    <>
      <h1 className="mt-5 font-heading text-2xl leading-tight">{view.referrer_name} would like to introduce you to {view.other}.</h1>
      <p className="mt-3 font-body text-sm">The conversation is about {view.why}.</p>
      {view.context && <blockquote className="mt-3 border-l-2 border-editorial-gold pl-3 font-body text-sm italic">{view.context}</blockquote>}
      <div className="mt-6 grid gap-2">
        <button disabled={busy} onClick={() => answer('yes')} className="rounded bg-editorial-copper py-3 font-body text-sm font-semibold text-editorial-cream disabled:opacity-50">Yes, introduce me</button>
        <button disabled={busy} onClick={() => answer('no')} className="rounded border border-editorial-navy/30 py-3 font-body text-sm text-editorial-navy disabled:opacity-50">Not now</button>
      </div>
      <p className="mt-4 font-body text-[11px] text-editorial-navy/60">Your answer goes only to {view.referrer_name}. Nothing else is shared.</p>
    </>
  );
}