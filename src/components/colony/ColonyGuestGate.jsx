import { base44 } from '@/api/base44Client';

const SPLASH = 'https://media.base44.com/images/public/68996845be6727838fdb822e/5f98f82d6_Top100AerospaceAdventure.png';

// The door to Colony for anyone not signed in: sign in, join, or walk in as a guest.
export default function ColonyGuestGate({ onGuest }) {
  const login = () => base44.auth.redirectToLogin(window.location.href);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <img src={SPLASH} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-x-3 bottom-6 mx-auto max-w-sm rounded-xl border border-editorial-gold/40 bg-slate-950/85 p-4 backdrop-blur">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-gold">Colony · Beta</p>
        <h1 className="mt-1 font-heading text-xl text-editorial-cream">Go online</h1>
        <p className="mt-1 text-xs text-editorial-cream/70">Sign in to keep your character and meet Fellows, or look around as a guest.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={login} className="rounded bg-editorial-copper py-2 text-xs font-bold uppercase tracking-wider text-editorial-cream">Log in</button>
          <button onClick={login} className="rounded border border-editorial-gold/60 py-2 text-xs font-bold uppercase tracking-wider text-editorial-gold">Join</button>
        </div>
        <button onClick={onGuest} className="mt-3 w-full rounded bg-editorial-cream py-2 text-xs font-bold uppercase tracking-wider text-editorial-navy">Continue as guest</button>
      </div>
    </div>
  );
}