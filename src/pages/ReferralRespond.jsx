import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortalShell from '@/components/referral-portal/PortalShell';
import PortalIntro from '@/components/referral-portal/PortalIntro';
import PortalAnswer from '@/components/referral-portal/PortalAnswer';
import ReferralAnswered from '@/components/conferences/referrals/ReferralAnswered';

// The referral mini-portal: introduction → answer → next steps. No sign-up.
export default function ReferralRespond() {
  const token = new URLSearchParams(window.location.search).get('t') || '';
  const [view, setView] = useState(null);
  const [state, setState] = useState('loading');
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    base44.functions.invoke('respondToReferral', { token })
      .then(({ data }) => { setView(data); setState('ready'); })
      .catch((e) => setState(e.response?.status === 404 ? 'missing' : 'error'));
    return () => meta.remove();
  }, [token]);

  const answer = async (a, share) => {
    setBusy(true); setError('');
    const res = await base44.functions.invoke('respondToReferral', { token, answer: a, share }).catch(() => null);
    setBusy(false);
    if (res?.data) { setView(res.data); setStep(2); } else setError('Your answer did not go through. Please try again.');
  };

  const note = (t) => <p className="font-heading text-xl leading-snug">{t}</p>;
  if (state === 'loading') return <PortalShell><Loader2 className="mx-auto my-6 h-6 w-6 animate-spin text-editorial-copper" /></PortalShell>;
  if (state === 'missing') return <PortalShell>{note("This link isn't valid. Check the email it came in, or reply to the person who sent it.")}</PortalShell>;
  if (state === 'error') return <PortalShell>{note('Something went wrong. Please try the link again in a moment.')}</PortalShell>;
  if (view.answered) return <PortalShell referrer={view.referrer_name} step={2}><ReferralAnswered view={view} /></PortalShell>;
  if (view.expired) return <PortalShell referrer={view.referrer_name}>{note(`This link has expired. Reply to ${view.referrer_name}'s email and they'll take it from there.`)}</PortalShell>;

  return (
    <PortalShell referrer={view.referrer_name} step={step}>
      {step === 0
        ? <PortalIntro view={view} onContinue={() => setStep(1)} />
        : <PortalAnswer view={view} busy={busy} error={error} onAnswer={answer} onBack={() => setStep(0)} />}
    </PortalShell>
  );
}