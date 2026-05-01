import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { brand, CONNECTION_OPTIONS } from './NominateConfig';

export default function StageAboutYou({ data, onUpdate, onContinue }) {
  const firstRef = useRef(null);
  useEffect(() => { setTimeout(() => firstRef.current?.focus(), 200); }, []);

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