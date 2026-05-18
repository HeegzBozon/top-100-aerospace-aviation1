import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Sparkles, Moon, Leaf, Rocket } from 'lucide-react';
import { subscribeNewsletter } from '@/functions/subscribeNewsletter';

const SOURCE_CONFIG = {
  moon_joy: {
    icon: Moon,
    iconColor: '#c9a87c',
    iconBg: 'rgba(201,168,124,0.15)',
    accentColor: '#c9a87c',
    borderColor: 'rgba(201,168,124,0.35)',
    bg: 'rgba(201,168,124,0.06)',
    label: 'Operation: Moon Joy',
    // Loss aversion + scarcity + reciprocity
    headline: "The conversations are happening without you.",
    subheadline: "Get session recaps, insider access, and the moments that matter — before the room fills up.",
    placeholder: "Your email address",
    cta: "Send me the updates",
    successHeadline: "You're in the room.",
    successBody: "Watch for your first update — it arrives before the next session.",
    // Social proof anchor
    socialProof: "300+ Fellows. 40+ Countries. Zero paid acquisition.",
  },
  common_ground: {
    icon: Leaf,
    iconColor: '#4ade80',
    iconBg: 'rgba(74,222,128,0.12)',
    accentColor: '#4ade80',
    borderColor: 'rgba(74,222,128,0.3)',
    bg: 'rgba(74,222,128,0.05)',
    label: 'CommonGround 5.0',
    headline: "CommonGround is being built now. Follow the work.",
    subheadline: "Site design updates, Permaculture progress, Solarpunk builder notes, and policy wins — direct to your inbox.",
    placeholder: "Your email address",
    cta: "Follow the build",
    successHeadline: "You're in the loop.",
    successBody: "CommonGround updates will reach you as the sites come online.",
    socialProof: "10 hubs planned. The first ones are already in motion.",
  },
  vision_2030: {
    icon: Rocket,
    iconColor: '#c9a87c',
    iconBg: 'rgba(201,168,124,0.15)',
    accentColor: '#c9a87c',
    borderColor: 'rgba(201,168,124,0.25)',
    bg: 'rgba(201,168,124,0.05)',
    label: '2030 Vision',
    headline: "We measure women in before history does.",
    subheadline: "Follow the institution as it builds toward 1,000 Fellows, 9 Volumes, and 10 CommonGround hubs. You'll want to know when this lands.",
    placeholder: "Your email address",
    cta: "Follow the record",
    successHeadline: "You're on the record.",
    successBody: "Institution updates and milestone announcements go to this list first.",
    socialProof: "Year 5. Compounding since 2021.",
  },
};

export default function NewsletterCapture({ source = 'general', compact = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG['moon_joy'];
  const Icon = config.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Enter a valid email address.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      await subscribeNewsletter({ email, source });
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Try again.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 border text-center"
        style={{ background: config.bg, borderColor: config.borderColor }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: config.iconBg }}>
          <Check className="w-5 h-5" style={{ color: config.accentColor }} />
        </div>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: config.accentColor }}
          className="text-lg font-bold mb-1">{config.successHeadline}</p>
        <p className="text-white/50 text-sm">{config.successBody}</p>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={config.placeholder}
          className="flex-1 px-4 py-3 rounded-full text-sm bg-white/6 border border-white/12 text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/50 transition-all"
          style={{ '--accent': config.accentColor }}
        />
        <button type="submit" disabled={status === 'loading'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all"
          style={{ background: config.accentColor, color: '#07111f', opacity: status === 'loading' ? 0.7 : 1 }}>
          {status === 'loading' ? 'Sending…' : config.cta} <ChevronRight className="w-3.5 h-3.5" />
        </button>
        {errorMsg && <p className="text-red-400 text-xs mt-1 w-full">{errorMsg}</p>}
      </form>
    );
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
      initial="hidden" whileInView="show" viewport={{ once: true }}
      className="rounded-2xl p-8 border"
      style={{ background: config.bg, borderColor: config.borderColor }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: config.iconBg }}>
          <Icon className="w-5 h-5" style={{ color: config.accentColor }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: config.accentColor }}>
            {config.label} · Updates
          </p>
        </div>
      </div>

      {/* Headline — Loss aversion framing */}
      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug">
        {config.headline}
      </h3>
      <p className="text-white/55 text-sm leading-relaxed mb-6">
        {config.subheadline}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={config.placeholder}
          className="flex-1 px-4 py-3 rounded-full text-sm bg-white/6 border border-white/12 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
        />
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          type="submit" disabled={status === 'loading'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-lg"
          style={{ background: config.accentColor, color: '#07111f', opacity: status === 'loading' ? 0.7 : 1 }}>
          {status === 'loading' ? 'Sending…' : config.cta} <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </form>

      {errorMsg && <p className="text-red-400 text-xs mb-3">{errorMsg}</p>}

      {/* Social proof + trust signals — Authority + Reciprocity */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: config.accentColor }} />
        <p className="text-white/30 text-xs">{config.socialProof} &nbsp;·&nbsp; No spam. Unsubscribe anytime.</p>
      </div>
    </motion.div>
  );
}