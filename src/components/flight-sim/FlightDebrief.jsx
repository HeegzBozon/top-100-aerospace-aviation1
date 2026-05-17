import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Zap, ChevronRight, Check, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TIERS = [
  {
    id: 'report',
    price: '$49',
    label: 'Flight Debrief',
    sub: 'AI coaching report',
    features: [
      'Your classification analyzed at career depth',
      'Signature strengths — top 2 stats as aerospace assets',
      'Blind spots — named directly, not softened',
      'Decision fingerprint from your choice pattern',
      'Boss Moment read — what your roll signals under pressure',
      'Fellow Benchmark comparison by sector',
      '3 specific development actions, ranked by leverage',
    ],
    highlight: false,
  },
  {
    id: 'report_mentor',
    price: '$149',
    label: 'Debrief + Mentor Call',
    sub: 'AI report + 30-min Fellow call',
    features: [
      'Everything in Flight Debrief',
      '30-minute 1:1 with a matched TOP 100 Fellow',
      'Matched by archetype, sector, and stat profile',
      "Booking via Fellow's live availability",
      'Platform fee: 20% · Fellow keeps 80%',
    ],
    highlight: true,
    badge: 'Most Valuable',
  },
];

export default function FlightDebrief({ profile, session, playerInfo }) {
  const [selected, setSelected] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async (tierId) => {
    if (!playerInfo?.email) {
      setError('Email required. Please ensure you completed the Signal Log.');
      return;
    }
    setPurchasing(true);
    setError(null);
    try {
      const { createFlightDebriefCheckout } = await import('@/functions/createFlightDebriefCheckout');
      const res = await createFlightDebriefCheckout({
        tier: tierId,
        email: playerInfo.email,
        name: playerInfo.name || '',
        classification: profile.classification,
        campaignId: session.campaignId,
        stats: session.stats,
        choices: session.choices,
        bossRoll: session.bossRoll,
      });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError('Could not initiate checkout. Please try again.');
      }
    } catch (e) {
      setError('Checkout failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (purchased) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 border border-emerald-500/30 text-center"
        style={{ background: 'rgba(16,185,129,0.06)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(16,185,129,0.15)' }}>
          <Check className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-emerald-400 font-bold mb-2">Debrief Purchased</p>
        <p className="text-white/50 text-sm">Your report will be delivered to {playerInfo?.email} within 60 seconds.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full border border-[#c9a87c]/30 text-[#c9a87c]/70 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(201,168,124,0.06)' }}>
          <FileText className="w-3.5 h-3.5" /> Unlock Your Flight Debrief
        </div>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          A senior executive coaching report built from your exact choices, stats, and Boss Moment result. Direct. Aerospace-specific. No generic advice.
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {TIERS.map((tier) => (
          <button key={tier.id}
            onClick={() => setSelected(tier.id)}
            className={`text-left rounded-2xl p-6 border transition-all duration-200 relative ${
              selected === tier.id
                ? 'border-[#c9a87c] scale-[1.01]'
                : tier.highlight
                  ? 'border-[#c9a87c]/40 hover:border-[#c9a87c]/70'
                  : 'border-white/10 hover:border-white/20'
            }`}
            style={{
              background: selected === tier.id
                ? 'rgba(201,168,124,0.1)'
                : tier.highlight
                  ? 'rgba(201,168,124,0.05)'
                  : 'rgba(255,255,255,0.02)',
            }}>
            {tier.badge && (
              <span className="absolute -top-2.5 left-5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#07111f]"
                style={{ background: '#c9a87c' }}>
                {tier.badge}
              </span>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white font-bold text-base">{tier.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{tier.sub}</p>
              </div>
              <div className="text-right">
                <p className="text-[#c9a87c] font-bold text-xl">{tier.price}</p>
                <p className="text-white/25 text-xs">one-time</p>
              </div>
            </div>
            <ul className="space-y-2">
              {tier.features.map(f => (
                <li key={f} className="flex gap-2 text-white/45 text-xs leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-[#c9a87c] flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {selected === tier.id && (
              <div className="mt-4 flex items-center gap-1.5 text-[#c9a87c] text-xs font-bold">
                <Zap className="w-3.5 h-3.5" /> Selected
              </div>
            )}
          </button>
        ))}
      </div>

      {/* CTA */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <button
              onClick={() => handlePurchase(selected)}
              disabled={purchasing}
              className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a090)', color: '#07111f' }}>
              {purchasing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <>Get {TIERS.find(t => t.id === selected)?.label} — {TIERS.find(t => t.id === selected)?.price} <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-red-400 text-xs text-center mt-3 flex items-center justify-center gap-1.5">
          <X className="w-3.5 h-3.5" /> {error}
        </motion.p>
      )}

      <p className="text-center text-white/20 text-xs mt-4">
        Secure payment via Stripe · PDF delivered to your Signal Log email within 60 seconds
      </p>
    </motion.div>
  );
}