import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Check, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  brand,
  combineGuidedReason,
  GUIDED_PROMPTS,
  emptyPersonNomination,
} from '@/components/nominate/NominateConfig';
import LocationSelect from '@/components/my-top100/LocationSelect';

const SHARE_OPTIONS = [
  { value: 'yes', label: 'Yes, credit me' },
  { value: 'no', label: 'Keep it anonymous' },
];

const PRIMARY_CATEGORIES = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
];

export default function HubNominationPopover({ onClose, onSubmitted, nominees, nominator }) {
  const [form, setForm] = useState(emptyPersonNomination);
  const [nominationCategory, setNominationCategory] = useState('women');
  const [alsoAngels, setAlsoAngels] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const matches =
    form.name && form.name.trim().length > 1
      ? nominees
          .filter(
            (n) =>
              n.name?.toLowerCase().includes(form.name.toLowerCase()) &&
              n.name.toLowerCase() !== form.name.toLowerCase()
          )
          .slice(0, 5)
      : [];

  const selectExisting = (nominee) => {
    setShowSuggestions(false);
    setSelectedNominee(nominee);
    setForm({
      ...emptyPersonNomination(),
      name: nominee.name || '',
      role_org: [nominee.title || nominee.professional_role, nominee.company || nominee.organization].filter(Boolean).join(' · '),
      link: nominee.linkedin_profile_url || nominee.website_url || '',
      email: nominee.nominee_email || '',
      location: nominee.country || '',
    });
  };

  const canSubmit =
    form.name?.trim() && form.role_org?.trim() && form.reason_contribution?.trim() && form.reason_impact?.trim() && form.share_name;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const reason = combineGuidedReason(form);

      const baseIntake = {
        nominee_name: (form.name || '').trim(),
        role_org: (form.role_org || '').trim(),
        link: (form.link || '').trim(),
        nominee_email: (form.email || '').trim(),
        location: (form.location || '').trim(),
        reason,
        share_name: form.share_name,
        nominator_name: nominator?.full_name || '',
        nominator_email: nominator?.email || '',
        source: 'my_top100_hub',
        status: 'new',
      };

      await base44.entities.NominationIntake.create({ ...baseIntake, nomination_type: nominationCategory });
      if (alsoAngels) {
        await base44.entities.NominationIntake.create({ ...baseIntake, nomination_type: 'angels' });
      }

      base44.analytics.track({ eventName: 'hub_nomination_submitted', properties: { category: nominationCategory, also_angels: alsoAngels, existing: !!selectedNominee } });
      if (selectedNominee) {
        onSubmitted({ existing: true, nominee: selectedNominee, category: nominationCategory, also_angels: alsoAngels });
      } else {
        onSubmitted({ existing: false, summary: { ...form, category: nominationCategory, also_angels: alsoAngels }, category: nominationCategory, also_angels: alsoAngels });
      }
      setDone(true);
    } catch (e) {
      console.warn('Hub nomination failed', e);
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const inputCls = 'w-full text-sm rounded-xl border p-3 bg-white outline-none transition-colors';
  const inputStyle = { borderColor: `${brand.navy}15`, color: brand.navy };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(10,18,30,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0.5 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full sm:max-w-lg max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{ background: brand.cream, boxShadow: '0 -10px 40px rgba(10,18,30,0.3)' }}
        >
          {done ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b8884a)` }}>
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                Nomination submitted
              </h3>
              <p className="text-xs leading-relaxed max-w-xs mb-5" style={{ color: `${brand.navy}60` }}>
                Your nomination for {form.name} is in review. Once approved, they'll appear in the verified directory.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${brand.navy}10`, background: 'white' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: `${brand.navy}50` }}>
                    TOP 100 Aerospace & Aviation
                  </p>
                  <h3 className="text-sm font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                    New Nomination
                  </h3>
                </div>
                <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${brand.navy}08` }}>
                  <X className="w-4 h-4" style={{ color: brand.navy }} />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto px-4 py-4 space-y-4 flex-1">
                {/* Category select */}
                <div>
                  <label className="block text-[11px] font-bold mb-2 uppercase tracking-wide" style={{ color: `${brand.navy}70` }}>
                    Nominate for
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIMARY_CATEGORIES.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setNominationCategory(c.key)}
                        className="text-xs font-semibold py-2.5 rounded-xl border transition-all"
                        style={{
                          background: nominationCategory === c.key ? brand.navy : 'white',
                          color: nominationCategory === c.key ? 'white' : `${brand.navy}70`,
                          borderColor: nominationCategory === c.key ? brand.navy : `${brand.navy}15`,
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Also Angels checkbox */}
                <button
                  type="button"
                  onClick={() => setAlsoAngels((v) => !v)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all"
                  style={{
                    background: alsoAngels ? `${brand.gold}12` : 'white',
                    borderColor: alsoAngels ? brand.gold : `${brand.navy}15`,
                  }}
                >
                  <div
                    className="h-5 w-5 rounded-md flex items-center justify-center shrink-0 border"
                    style={{ background: alsoAngels ? brand.gold : 'white', borderColor: alsoAngels ? brand.gold : `${brand.navy}30` }}
                  >
                    {alsoAngels && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold" style={{ color: brand.navy }}>Also nominate for Angels</p>
                    <p className="text-[10px]" style={{ color: `${brand.navy}50` }}>Recognize them as an angel investor too — they'll show in both tabs.</p>
                  </div>
                </button>

                <Field label="NAME *" hint="Search for them, or type a new name">
                  <div className="relative">
                    <input
                      value={form.name}
                      onChange={(e) => {
                        update('name', e.target.value);
                        setShowSuggestions(true);
                        if (selectedNominee && e.target.value.trim().toLowerCase() !== selectedNominee.name.toLowerCase()) {
                          setSelectedNominee(null);
                        }
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Search or type a name…"
                      className={inputCls}
                      style={inputStyle}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${brand.navy}30` }} />
                    <AnimatePresence>
                      {showSuggestions && matches.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-lg"
                          style={{ background: 'white', border: `1px solid ${brand.navy}15` }}
                        >
                          {matches.map((n) => (
                            <button
                              key={n.id}
                              onMouseDown={(e) => { e.preventDefault(); selectExisting(n); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[#f9f7f4] transition-colors"
                            >
                              <div className="h-8 w-8 rounded-full overflow-hidden shrink-0" style={{ background: `${brand.navy}08` }}>
                                {(n.photo_url || n.avatar_url) ? (
                                  <img src={n.photo_url || n.avatar_url} alt={n.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-[10px] font-bold" style={{ color: brand.navy }}>
                                    {n.name?.[0]?.toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: brand.navy }}>{n.name}</p>
                                <p className="text-[10px] truncate" style={{ color: `${brand.navy}50` }}>
                                  {n.professional_role || n.title}{n.organization || n.company ? ` · ${n.organization || n.company}` : ''}
                                </p>
                              </div>
                              <span className="text-[9px] font-bold uppercase shrink-0" style={{ color: brand.gold }}>Add</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Field>

                {selectedNominee && (
                  <div className="flex items-center gap-1.5 text-[10px] -mt-1" style={{ color: '#2d8a4f' }}>
                    <Check className="w-3 h-3" /> Pre-filled from an existing profile — review the questions and submit
                  </div>
                )}

                <Field label="CURRENT ROLE AND ORGANIZATION *" hint="As specific as you can. Helps us find them.">
                  <input value={form.role_org} onChange={(e) => update('role_org', e.target.value)} placeholder="e.g. Propulsion Engineer at Blue Origin" className={inputCls} style={inputStyle} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="LINKEDIN OR WEBSITE" hint="Optional">
                    <input value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://..." className={inputCls} style={inputStyle} />
                  </Field>
                  <Field label="EMAIL" hint="Optional">
                    <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" className={inputCls} style={inputStyle} />
                  </Field>
                </div>

                <Field label="LOCATION" hint="Primary + secondary (optional)">
                  <LocationSelect value={form.location} onChange={(v) => update('location', v)} />
                </Field>

                {GUIDED_PROMPTS.map((p) => (
                  <div key={p.key}>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: `${brand.navy}70` }}>
                      {p.label}
                    </label>
                    <textarea
                      value={form[p.key]}
                      onChange={(e) => update(p.key, e.target.value)}
                      rows={2}
                      placeholder="Share a specific example…"
                      className="w-full text-sm rounded-xl border p-3 bg-white outline-none resize-none"
                      style={inputStyle}
                    />
                  </div>
                ))}

                {/* Credit */}
                <div>
                  <label className="block text-[11px] font-bold mb-2 uppercase tracking-wide" style={{ color: `${brand.navy}70` }}>
                    CREDIT YOUR NAME?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SHARE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => update('share_name', opt.value)}
                        className="text-xs font-semibold py-2.5 rounded-xl border transition-all"
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

                {error && <p className="text-xs font-medium" style={{ color: '#c0392b' }}>{error}</p>}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 shrink-0" style={{ borderTop: `1px solid ${brand.navy}10`, background: 'white' }}>
                <motion.button
                  whileTap={{ scale: canSubmit ? 0.97 : 1 }}
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all"
                  style={{
                    background: canSubmit ? `linear-gradient(135deg, ${brand.navy}, #0b2542)` : `${brand.navy}15`,
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
                    Complete name, role, contribution, impact, and credit to submit.
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold mb-1 uppercase tracking-wide" style={{ color: `${brand.navy}70` }}>
        {label}
      </label>
      {hint && <p className="text-[10px] mb-1.5" style={{ color: `${brand.navy}40` }}>{hint}</p>}
      {children}
    </div>
  );
}