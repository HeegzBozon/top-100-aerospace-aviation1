import { useState } from 'react';
import { ChevronRight, Check, Sparkles, Mail } from 'lucide-react';
import { subscribeNewsletter } from '@/functions/subscribeNewsletter';

// Pages that get specific GHL smart list targeting
const PAGE_SOURCE_MAP = {
  'Vision2030': 'vision_2030',
  'Hangouts': 'moon_joy',
  'CommonGround': 'common_ground',
};

const SOURCE_CONFIG = {
  vision_2030: { accent: '#c9a87c', label: '2030 Vision Updates', cta: 'Follow the record' },
  moon_joy: { accent: '#c9a87c', label: 'Operation: Moon Joy Updates', cta: 'Send me the updates' },
  common_ground: { accent: '#4ade80', label: 'CommonGround 5.0 Updates', cta: 'Follow the build' },
  general: { accent: '#c9a87c', label: 'TOP 100 Newsletter', cta: 'Subscribe' },
};

// Pages where we skip (they have their own inline blocks or no footer needed)
const HIDDEN_PAGES = ['Landing', 'NotFound', 'Comms', 'Home', 'Colony'];

export default function GlobalNewsletterFooter({ currentPageName, dark = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  if (HIDDEN_PAGES.includes(currentPageName)) return null;

  const source = PAGE_SOURCE_MAP[currentPageName] || 'general';
  const config = SOURCE_CONFIG[source];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      await subscribeNewsletter({ email, source });
      setStatus('success');
    } catch {
      setStatus('idle');
    }
  };

  const bgStyle = dark
    ? { background: 'rgba(7,17,31,0.92)', borderColor: 'rgba(201,168,124,0.15)' }
    : { background: 'linear-gradient(90deg, rgba(30,58,90,0.05) 0%, rgba(201,168,124,0.05) 100%)', borderColor: 'rgba(30,58,90,0.1)' };

  const labelColor = dark ? 'rgba(255,255,255,0.4)' : '#64748b';
  const inputClass = dark
    ? 'flex-1 px-4 py-2 rounded-full text-sm border bg-white/8 text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-all'
    : 'flex-1 px-4 py-2 rounded-full text-sm border bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all';
  const inputBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(30,58,90,0.15)';
  const proofColor = dark ? 'rgba(255,255,255,0.25)' : '#94a3b8';

  return (
    <div
      className="w-full border-t px-4 py-5 flex flex-col sm:flex-row items-center gap-3"
      style={bgStyle}
    >
      {/* Label */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Mail className="w-4 h-4" style={{ color: config.accent }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: labelColor }}>
          {config.label}
        </span>
      </div>

      {status === 'success' ? (
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: config.accent }}>
          <Check className="w-4 h-4" /> You're in — check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-1 gap-2 w-full sm:max-w-md">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email address"
            className={inputClass}
            style={{ borderColor: inputBorder }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
            style={{ background: config.accent, color: dark ? '#07111f' : '#fff' }}
          >
            {status === 'loading' ? '…' : config.cta}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      <p className="text-xs hidden md:flex items-center gap-1 flex-shrink-0" style={{ color: proofColor }}>
        <Sparkles className="w-3 h-3" /> No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}