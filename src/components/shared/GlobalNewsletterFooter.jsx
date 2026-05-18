import { useState } from 'react';
import { ChevronRight, Check, Mail } from 'lucide-react';
import { subscribeNewsletter } from '@/functions/subscribeNewsletter';

const PAGE_SOURCE_MAP = {
  'Vision2030': 'vision_2030',
  'Hangouts': 'moon_joy',
  'CommonGround': 'common_ground',
};

const SOURCE_CONFIG = {
  vision_2030: { accent: '#c9a87c', placeholder: 'Your email — follow the record', cta: 'Follow' },
  moon_joy: { accent: '#c9a87c', placeholder: 'Your email — join Moon Joy updates', cta: 'Join' },
  common_ground: { accent: '#4ade80', placeholder: 'Your email — follow the build', cta: 'Follow' },
  general: { accent: '#c9a87c', placeholder: 'Your email address', cta: 'Subscribe' },
};

const HIDDEN_PAGES = ['Landing', 'NotFound', 'Comms', 'Home', 'Colony'];

// variant="header" — compact inline form for embedding in navbars
// variant="footer" — sticky bottom bar (legacy, kept for compatibility)
export default function GlobalNewsletterFooter({ currentPageName, dark = false, variant = 'footer' }) {
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

  if (variant === 'header') {
    return status === 'success' ? (
      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: config.accent }}>
        <Check className="w-3.5 h-3.5" /> You're in!
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="hidden md:flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={config.placeholder}
          className="w-48 lg:w-56 px-3 py-1.5 rounded-full text-xs border text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all"
          style={{ borderColor: 'rgba(201,168,124,0.4)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all hover:opacity-90 active:scale-95"
          style={{ background: config.accent, color: '#07111f' }}
        >
          {status === 'loading' ? '…' : config.cta}
          <ChevronRight className="w-3 h-3" />
        </button>
      </form>
    );
  }

  // footer variant (sticky bottom bar)
  const bgStyle = dark
    ? { background: 'rgba(7,17,31,0.95)', borderColor: 'rgba(201,168,124,0.15)' }
    : { background: 'linear-gradient(90deg, rgba(30,58,90,0.05) 0%, rgba(201,168,124,0.05) 100%)', borderColor: 'rgba(30,58,90,0.1)' };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 w-full border-t px-4 py-3 flex flex-col sm:flex-row items-center gap-3"
      style={bgStyle}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <Mail className="w-4 h-4" style={{ color: config.accent }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: dark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>
          Newsletter
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
            className="flex-1 px-4 py-2 rounded-full text-sm border bg-white/8 text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-all"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:opacity-90"
            style={{ background: config.accent, color: '#07111f' }}
          >
            {status === 'loading' ? '…' : config.cta}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}