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
  vision_2030: {
    accent: '#c9a87c',
    label: '2030 Vision Updates',
    cta: 'Follow the record',
  },
  moon_joy: {
    accent: '#c9a87c',
    label: 'Operation: Moon Joy Updates',
    cta: 'Send me the updates',
  },
  common_ground: {
    accent: '#4ade80',
    label: 'CommonGround 5.0 Updates',
    cta: 'Follow the build',
  },
  general: {
    accent: '#c9a87c',
    label: 'TOP 100 Newsletter',
    cta: 'Subscribe',
  },
};

// Pages where we hide the footer entirely (they have their own or don't need it)
const HIDDEN_PAGES = ['Landing', 'NotFound', 'Comms', 'Home', 'Colony'];

export default function GlobalNewsletterFooter({ currentPageName }) {
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

  return (
    <div
      className="w-full border-t px-4 py-5 flex flex-col sm:flex-row items-center gap-3"
      style={{
        background: 'linear-gradient(90deg, rgba(30,58,90,0.06) 0%, rgba(201,168,124,0.06) 100%)',
        borderColor: 'rgba(30,58,90,0.1)',
      }}
    >
      {/* Label */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Mail className="w-4 h-4" style={{ color: config.accent }} />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
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
            className="flex-1 px-4 py-2 rounded-full text-sm border bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: 'rgba(30,58,90,0.15)', '--tw-ring-color': config.accent + '40' }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
            style={{ background: config.accent, color: '#fff' }}
          >
            {status === 'loading' ? '…' : config.cta}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      <p className="text-xs text-slate-400 flex-shrink-0 hidden md:flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}