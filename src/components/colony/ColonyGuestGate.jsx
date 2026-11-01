import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const SPLASH = 'https://media.base44.com/images/public/68996845be6727838fdb822e/5f98f82d6_Top100AerospaceAdventure.png';

// The door to Colony for anyone not signed in: sign in, join, or walk in as a guest.
export default function ColonyGuestGate({ onGuest }) {
  const [name, setName] = useState('');
  const enter = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    sessionStorage.setItem('colony-guest-name', name.trim().slice(0, 40));
    onGuest();
  };
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
        <form onSubmit={enter} className="mt-3 flex gap-2 border-t border-editorial-cream/10 pt-3">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Your name"
            className="min-w-0 flex-1 rounded bg-white/10 px-3 py-2 text-editorial-cream placeholder:text-editorial-cream/40 outline-none" />
          <button type="submit" disabled={!name.trim()} className="rounded bg-editorial-cream px-3 text-xs font-bold uppercase tracking-wider text-editorial-navy disabled:opacity-40">Guest</button>
        </form>
      </div>
    </div>
  );
}