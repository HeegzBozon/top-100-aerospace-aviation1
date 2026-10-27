import { useEffect } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';

// The ballot is a Fellow's work.
//
// A visitor who asks for it by name — the title screen's Vote key, the bar's own entry, a
// link somebody sent them — is taken to the platform's own door rather than shown it: the
// same door that signs a Fellow in, and that opens the account a visitor has not made yet.
// Where the reader is standing travels with them, so the ballot is what they come back to.
//
// The press is offered as well as made, because a redirect can be refused and the way in
// must never be a wall with nothing on it.
export default function NominateBallotGate() {
  const toLogin = () => base44.auth.redirectToLogin(window.location.href);

  useEffect(() => {
    toLogin();
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ background: brand.cream }}
    >
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl shadow-xl"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
      >
        <Lock className="h-7 w-7" style={{ color: brand.gold }} />
      </div>

      <p
        className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em]"
        style={{ color: brand.gold }}
      >
        Fellows measure
      </p>

      <h1
        className="mb-3 max-w-md text-2xl leading-tight sm:text-3xl"
        style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        The ballot opens for Fellows
      </h1>

      <p
        className="mb-8 max-w-md text-sm leading-relaxed"
        style={{ color: `${brand.navy}70`, fontFamily: "'Montserrat', sans-serif" }}
      >
        Anyone may nominate and anyone may read the edition. Weighing the nominees against one
        another is the work of a Fellow, so it asks who you are first.
      </p>

      <button
        type="button"
        onClick={toLogin}
        className="flex items-center gap-2 rounded-full px-8 py-3 font-bold shadow-lg"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: '#FAF8F5' }}
      >
        <LogIn className="h-4 w-4" />
        Sign in or join
      </button>
    </div>
  );
}