import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Check, Loader2, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand, combineGuidedReason, GUIDED_PROMPTS } from '@/components/nominate/NominateConfig';

const TRACKS = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

const SHARE_OPTIONS = [
  { value: 'yes', label: 'Yes, share my name' },
  { value: 'no', label: 'Keep it anonymous' },
];

export default function InlineNominateNew({ initialName = '', onDone, onBack }) {
  const [form, setForm] = useState({
    nomination_type: 'women',
    name: initialName,
    role_org: '',
    link: '',
    location: '',
    reason_contribution: '',
    reason_impact: '',
    reason_leadership: '',
    share_name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canSubmit =
    form.name.trim() &&
    form.reason_contribution.trim() &&
    form.reason_impact.trim() &&
    form.share_name &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const me = await base44.auth.me().catch(() => ({ full_name: '', email: '' }));
      const reason = combineGuidedReason(form);

      await base44.entities.NominationIntake.create({
        nomination_type: form.nomination_type,
        nominee_name: form.name.trim(),
        role_org: form.role_org.trim(),
        link: form.link.trim(),
        location: form.location.trim(),
        reason,
        share_name: form.share_name,
        nominator_name: me.full_name || '',
        nominator_email: me.email || '',
        source: 'my_top100_inline_nominate',
        status: 'new',
      });

      base44.analytics.track({ eventName: 'my_top100_inline_nominate', properties: { track: form.nomination_type } });
      setDone(true);
    } catch (e) {
      console.warn('Inline nominate failed', e);
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b8884a)` }}>
          <Check className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-base font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Nomination submitted
        </h3>
        <p className="text-xs leading-relaxed max-w-xs mb-5" style={{ color: `${brand.navy}60` }}>
          Your nomination for {form.name.trim()} is in review. Once approved, they'll appear in the directory so you can add them to your list.
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
    <div className="flex flex-col">
      {/* Sub-header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: `${brand.navy}10` }}>
        {onBack && (
          <button onClick={onBack} className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${brand.navy}08` }}>
            <ArrowLeft className="w-4 h-4" style={{ color: brand.navy }} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: `${brand.navy}50` }}>New Nomination</p>
          <h3 className="text-sm font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            Nominate a leader
          </h3>
        </div>
        <UserPlus className="w-4 h-4 shrink-0" style={{ color: brand.gold }} />
      </div>

      <div className="overflow-y-auto px-4 py-4 space-y-4">
        {/* Track selector */}
        <div>
          <label className="block text-[11px] font-bold mb-2 uppercase tracking-wide" style={{ color: `${brand.navy}70` }}>
            Track
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TRACKS.map(t => (
              <button
                key={t.key}
                onClick={() => update('nomination_type', t.key)}
                className="text-xs font-semibold py-2.5 rounded-2xl border transition-all"
                style={{
                  background: form.nomination_type === t.key ? brand.navy : 'white',
                  color: form.nomination_type === t.key ? 'white' : `${brand.navy}70`,
                  borderColor: form.nomination_type === t.key ? brand.navy : `${brand.navy}15`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <Field label="Full name">
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Jane Doe"
            className="w-full text-sm rounded-2xl border p-3 bg-white outline-none"
            style={{ borderColor: `${brand.navy}15`, color: brand.navy }}
          />
        </Field>

        {/* Role / Org */}
        <Field label="Role & organization">
          <input
            value={form.role_org}
            onChange={e => update('role_org', e.target.value)}
            placeholder="CEO, Skyframe Aerospace"
            className="w-full text-sm rounded-2xl border p-3 bg-white outline-none"
            style={{ borderColor: `${brand.navy}15`, color: brand.navy }}
          />
        </Field>

        {/* Link */}
        <Field label="LinkedIn or website">
          <input
            value={form.link}
            onChange={e => update('link', e.target.value)}
            placeholder="linkedin.com/in/…"
            className="w-full text-sm rounded-2xl border p-3 bg-white outline-none"
            style={{ borderColor: `${brand.navy}15`, color: brand.navy }}
          />
        </Field>

        {/* Location */}
        <Field label="Location (optional)">
          <input
            value={form.location}
            onChange={e => update('location', e.target.value)}
            placeholder="Houston, TX"
            className="w-full text-sm rounded-2xl border p-3 bg-white outline-none"
            style={{ borderColor: `${brand.navy}15`, color: brand.navy }}
          />
        </Field>

        {/* Guided prompts */}
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

        {/* Credit */}
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
          whileTap={{ scale: canSubmit ? 0.97 : 1 }}
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
          style={{
            background: canSubmit ? `linear-gradient(135deg, ${brand.navy}, #0b2542)` : `${brand.navy}20`,
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
            Complete name, contribution, impact, and credit fields to submit.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: brand.navy }}>{label}</label>
      {children}
    </div>
  );
}