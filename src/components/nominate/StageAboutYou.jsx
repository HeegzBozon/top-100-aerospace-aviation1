import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, UserPlus, LogOut, CheckCircle2 } from 'lucide-react';
import { brand, CONNECTION_OPTIONS } from './NominateConfig';

export default function StageAboutYou({ data, onUpdate, onContinue, user, onLogin, onLogout }) {
  const firstRef = useRef(null);
  useEffect(() => { if (!user) setTimeout(() => firstRef.current?.focus(), 200); }, [user]);

  const valid = data.name?.trim() && data.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && data.connection;

  const handleKey = (e) => {
    if (e.key === 'Enter' && valid && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
      onContinue();
    }
  };

  return (
    <div className="space-y-7 py-4" onKeyDown={handleKey}>
      <h1 className="text-2xl md:text-4xl font-bold leading-tight" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
        First, tell us a little about you.
      </h1>

      {user ? (
        <div className="rounded-2xl border p-4 flex items-center justify-between gap-3" style={{ borderColor: `${brand.gold}45`, background: `${brand.gold}0F` }}>
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: brand.navy }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>{user.full_name || user.email}</p>
              <p className="text-xs truncate" style={{ color: `${brand.navy}80` }}>Signed in — your details are pre-filled</p>
            </div>
          </div>
          <button onClick={onLogout} className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full" style={{ color: brand.navy, background: 'white' }}>
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${brand.navy}70` }}>
            Have an account?
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button onClick={onLogin} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5" style={{ borderColor: brand.navy, color: brand.navy, background: 'white' }}>
              <LogIn className="w-4 h-4" /> Log in
            </button>
            <button onClick={onLogin} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 text-white" style={{ background: brand.navy }}>
              <UserPlus className="w-4 h-4" /> Create account
            </button>
          </div>
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1" style={{ background: `${brand.navy}18` }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: `${brand.navy}60` }}>or continue as guest</span>
            <div className="h-px flex-1" style={{ background: `${brand.navy}18` }} />
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Field label="Your Name" required>
          <Input ref={firstRef} value={data.name || ''} onChange={e => onUpdate('name', e.target.value)} placeholder="Jane Doe" className="bg-white h-12 text-base" />
        </Field>
        <Field label="Your Email" required>
          <Input type="email" value={data.email || ''} onChange={e => onUpdate('email', e.target.value)} placeholder="jane@aerospace.com" className="bg-white h-12 text-base" />
        </Field>
        <Field label="Your connection to aerospace and aviation" required>
          <div className="space-y-2">
            {CONNECTION_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => onUpdate('connection', opt)}
                className={`w-full text-left p-3.5 rounded-xl border-2 text-sm transition-all cursor-pointer ${
                  data.connection === opt
                    ? 'border-[#c9a87c] bg-[#c9a87c]/8'
                    : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/30 bg-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Button
        onClick={onContinue}
        disabled={!valid}
        size="lg"
        className="rounded-full px-8 py-6 text-base text-white gap-2 cursor-pointer shadow-lg disabled:opacity-40"
        style={{ background: brand.navy }}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: `${brand.navy}70` }}>
        {label}{required && <span style={{ color: brand.gold }}> *</span>}
      </label>
      {children}
    </div>
  );
}