import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock } from 'lucide-react';

export default function SignalLog({ onComplete }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim() && email.trim() && email.includes('@') && consent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600)); // brief pause for effect
    onComplete({ name: name.trim(), email: email.trim(), consent });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.2), rgba(201,168,124,0.05))' }}>
              <Save className="w-6 h-6 text-[#c9a87c]" />
            </div>
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Signal Log</p>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-3xl font-bold text-white mb-3">Save Your Progress</h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
              You're halfway through the mission. Log your signal to save your session and receive your Flight Profile when the campaign concludes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Pilot Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/25 border border-white/10 focus:border-[#c9a87c]/50 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', fontSize: '16px' }}
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Signal Address (Email)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/25 border border-white/10 focus:border-[#c9a87c]/50 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', fontSize: '16px' }}
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl p-4 border border-white/8 cursor-pointer hover:border-[#c9a87c]/30 transition-colors"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${
                consent ? 'bg-[#c9a87c] border-[#c9a87c]' : 'border-white/20'
              }`} onClick={() => setConsent(!consent)}>
                {consent && <span className="text-[#07111f] text-xs font-bold">✓</span>}
              </div>
              <p className="text-white/50 text-xs leading-relaxed">
                I agree to receive mission updates and community communications from TOP 100 Aerospace & Aviation. I understand my Flight Profile data will be used to match me with relevant community resources. I can unsubscribe at any time.
              </p>
            </label>

            <div className="flex items-center gap-2 text-white/25 text-xs px-1">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>Your data is never sold. Used only to route your Flight Profile and community access. GDPR/CCPA compliant.</span>
            </div>

            <motion.button type="submit" disabled={!canSubmit || submitting}
              whileHover={canSubmit ? { scale: 1.02 } : {}} whileTap={canSubmit ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                canSubmit
                  ? 'bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] shadow-[0_0_25px_rgba(201,168,124,0.3)]'
                  : 'bg-white/5 text-white/25 cursor-not-allowed'
              }`}>
              {submitting ? 'Logging signal...' : 'Log Signal — Continue Mission'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}