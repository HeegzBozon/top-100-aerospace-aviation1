import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand, combineGuidedReason, GUIDED_PROMPTS } from '@/components/nominate/NominateConfig';

const SHARE_OPTIONS = [
  { value: 'yes', label: 'Yes, share my name' },
  { value: 'no', label: 'Keep it anonymous' },
];

export default function NomineeNominateSheet({ nominee, onBack, onDone }) {
  const [form, setForm] = useState({
    reason_contribution: '',
    reason_impact: '',
    reason_leadership: '',
    share_name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canSubmit = form.reason_contribution.trim() && form.reason_impact.trim() && form.share_name;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const me = await base44.auth.me().catch(() => ({ full_name: '', email: '' }));

      // Infer nomination track from nominee metadata
      const text = `${nominee.description || ''} ${nominee.industry || ''} ${nominee.discipline || ''} ${nominee.category || ''}`.toLowerCase();
      let nomination_type = 'men';
      if (text.includes('angel') || text.includes('investor') || text.includes('vc')) nomination_type = 'angels';
      else if (text.includes('woman') || text.includes('female')) nomination_type = 'women';

      const reason = combineGuidedReason(form);

      await base44.entities.NominationIntake.create({
        nomination_type,
        nominee_name: nominee.name,
        nominee_email: nominee.nominee_email || '',
        role_org: nominee.title || nominee.professional_role || '',
        link: nominee.linkedin_profile_url || nominee.website_url || '',
        location: nominee.country || '',
        reason,
        share_name: form.share_name,
        nominator_name: me.full_name || '',
        nominator_email: me.email || '',
        source: 'my_top100_quick_nominate',
        status: 'new',
      });

      base44.analytics.track({ eventName: 'my_top100_quick_nominate', properties: { nominee_id: nominee.id } });
      setDone(true);
    } catch (e) {
      console.warn('Quick nominate failed', e);
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center"
      >
        <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b8884a)` }}>
          <Check className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Nomination submitted
        </h3>
        <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: `${brand.navy}60` }}>
          Your nomination for {nominee.name} is in review. Thank you for contributing to the verified reputation graph.
        </p>
        <button
          onClick={onDone}
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
        >
          Back to browsing
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: `${brand.navy}10` }}>
        <button onClick={onBack} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${brand.navy}08` }}>
          <ArrowLeft className="w-4 h-4" style={{ color: brand.navy }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: `${brand.navy}50` }}>Nominate</p>
          <h3 className="text-sm font-bold truncate" style={{ color: brand.navy }}>{nominee.name}</h3>
        </div>
      </div>

      {/* Prefilled summary */}
      {(nominee.title || nominee.professional_role || nominee.company) && (
        <div className="mx-4 mt-3 p-3 rounded-2xl" style={{ background: `${brand.navy}06` }}>
          <p className="text-[11px]" style={{ color: `${brand.navy}70` }}>
            {nominee.title || nominee.professional_role}{nominee.company ? ` · ${nominee.company}` : ''}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {GUIDED_PROMPTS.map(p => (
          <div key={p.key}>
            <label className="block text-xs font-bold mb-1.5" style={{ color: brand.navy }}>
              {p.label}
            </label>
            <textarea
              value={form[p.key]}
              onChange={e => update(p.key, e.target.value)}
              rows={3}
              className="w-full text-sm rounded-2xl border p-3 bg-white outline-none resize-none"
              style={{ borderColor: `${brand.navy}15`, color: brand.navy }}
              placeholder="Share a specific example…"
            />
          </div>
        ))}

        <div>
          <label className="block text-xs font-bold mb-2" style={{ color: brand.navy }}>
            Credit your name?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SHARE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => update('share_name', opt.value)}
                className="text-xs font-semibold py-2.5 rounded-2xl border transition-all"
                style={{
                  background: form.share_name === opt.value ? brand.navy : 'white',
                  color: form.share_name === opt.value ? 'white' : `${brand.navy}70`,
                  borderColor: form.share_name === opt.value ? brand.navy : `${brand.navy}15`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer submit */}
      <div className="px-4 py-3 border-t" style={{ borderColor: `${brand.navy}10`, background: brand.cream }}>
        <motion.button
          whileTap={{ scale: canSubmit && !submitting ? 0.97 : 1 }}
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
          style={{
            background: canSubmit && !submitting ? `linear-gradient(135deg, ${brand.navy}, #0b2542)` : `${brand.navy}20`,
            color: 'white',
          }}
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Nomination</>
          )}
        </motion.button>
        {!canSubmit && !submitting && (
          <p className="text-[10px] text-center mt-2" style={{ color: `${brand.navy}50` }}>
            Complete the contribution, impact, and credit fields to submit.
          </p>
        )}
      </div>
    </div>
  );
}