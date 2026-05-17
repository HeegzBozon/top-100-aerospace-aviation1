import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function CGSignalLog({ onComplete }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !consent) return;
    setSubmitted(true);
    setTimeout(() => onComplete({ name, email, consent }), 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(74,222,128,0.1)' }}>
            <MapPin className="w-5 h-5 text-[#4ade80]" />
          </div>
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-2">Checkpoint</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl font-bold text-white mb-3">Log Your Progress</h2>
          <p className="text-white/40 text-sm leading-relaxed">Save your session and join the CommonGround coalition.</p>
        </motion.div>

        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#4ade80]/40 transition-colors" />
          <input
            type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#4ade80]/40 transition-colors" />
          <label className="flex items-start gap-3 cursor-pointer group">
            <div onClick={() => setConsent(!consent)}
              className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${
                consent ? 'border-[#4ade80] bg-[#4ade80]' : 'border-white/20'
              }`}>
              {consent && <span className="text-[#03080f] text-xs font-bold">✓</span>}
            </div>
            <span className="text-white/35 text-xs leading-relaxed">
              I want to receive updates on CommonGround and the TOP 100 community. No spam. You can opt out anytime.
            </span>
          </label>

          <button type="submit" disabled={!name || !email || !consent || submitted}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
              name && email && consent ? 'hover:scale-[1.01]' : 'opacity-40 cursor-not-allowed'
            }`}
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
            {submitted ? 'Logged ✓' : 'Save & Continue'}
          </button>
        </motion.form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center mt-6">
          <button onClick={() => onComplete({ name: 'Anonymous', email: '', consent: false })}
            className="text-white/25 text-xs hover:text-white/50 transition-colors underline underline-offset-2">
            Skip — continue without saving
          </button>
        </motion.div>
      </div>
    </div>
  );
}