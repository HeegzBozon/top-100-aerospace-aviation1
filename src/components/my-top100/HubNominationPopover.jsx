import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Check, Search, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  brand,
  combineGuidedReason,
  GUIDED_PROMPTS,
  LOCAL_LEGEND_TYPES,
  emptyPersonNomination,
  emptyAngelNomination,
  emptyLocalLegend,
} from '@/components/nominate/NominateConfig';

const SHARE_OPTIONS = [
  { value: 'yes', label: 'Yes, credit me' },
  { value: 'no', label: 'Keep it anonymous' },
];

const FACTORIES = {
  person: emptyPersonNomination,
  angel: emptyAngelNomination,
  local_legend: emptyLocalLegend,
};

export default function HubNominationPopover({ category, onClose, onSubmitted, nominees, nominator }) {
  const [form, setForm] = useState(FACTORIES[category.type]());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const isPerson = category.type === 'person';
  const isAngel = category.type === 'angel';
  const isLocal = category.type === 'local_legend';

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const matches =
    isPerson && form.name && form.name.trim().length > 1
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
    onSubmitted({ existing: true, nominee });
    setForm(FACTORIES[category.type]());
  };

  const canSubmit = (() => {
    if (isPerson) return form.name?.trim() && form.role_org?.trim() && form.reason_contribution?.trim() && form.reason_impact?.trim() && form.share_name;
    if (isAngel) return form.name?.trim() && form.investing_in?.trim() && form.reason?.trim() && form.share_name;
    if (isLocal) return form.business_name?.trim() && form.business_type?.trim() && form.city?.trim() && form.reason?.trim() && form.share_name;
    return false;
  })();

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const reason = isPerson ? combineGuidedReason(form) : form.reason?.trim() || '';

      if (isPerson || isAngel) {
        await base44.entities.NominationIntake.create({
          nomination_type: category.key,
          nominee_name: (form.name || '').trim(),
          role_org: (form.role_org || '').trim(),
          firm: isAngel ? (form.firm || '').trim() : '',
          link: (form.link || '').trim(),
          nominee_email: (form.email || '').trim(),
          location: (form.location || '').trim(),
          investing_in: isAngel ? (form.investing_in || '').trim() : '',
          reason,
          share_name: form.share_name,
          nominator_name: nominator?.full_name || '',
          nominator_email: nominator?.email || '',
          source: 'my_top100_hub',
          status: 'new',
        });
      } else if (isLocal) {
        await base44.entities.LocalLegendNomination.create({
          business_name: form.business_name.trim(),
          business_type: form.business_type,
          city: form.city.trim(),
          owner_name: (form.owner_name || '').trim(),
          link: (form.link || '').trim(),
          reason: form.reason.trim(),
          share_name: form.share_name,
          nominator_name: nominator?.full_name || '',
          nominator_email: nominator?.email || '',
          source: 'my_top100_hub',
          status: 'new',
        });
      }

      base44.analytics.track({ eventName: 'hub_nomination_submitted', properties: { category: category.key } });
      onSubmitted({ existing: false, summary: { ...form, category: category.key } });
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
                Your nomination for {isLocal ? form.business_name : form.name} is in review. Once approved, they'll appear in the verified directory.
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
                    {category.heading}
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
                {isPerson && (
                  <>
                    <Field label="NAME *" hint={`Search for ${category.pronoun}, or type a new name`}>
                      <div className="relative">
                        <input
                          value={form.name}
                          onChange={(e) => { update('name', e.target.value); setShowSuggestions(true); }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                          placeholder={`Search or type a name…`}
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

                    <Field label="LOCATION" hint="Optional">
                      <input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Houston, TX" className={inputCls} style={inputStyle} />
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
                  </>
                )}

                {isAngel && (
                  <>
                    <Field label="ANGEL NAME *">
                      <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Doe" className={inputCls} style={inputStyle} />
                    </Field>
                    <Field label="FIRM / FUND">
                      <input value={form.firm} onChange={(e) => update('firm', e.target.value)} placeholder="Starbridge Capital" className={inputCls} style={inputStyle} />
                    </Field>
                    <Field label="INVESTING IN *" hint="What sectors / stages do they back?">
                      <input value={form.investing_in} onChange={(e) => update('investing_in', e.target.value)} placeholder="Seed-stage space startups, aviation mobility" className={inputCls} style={inputStyle} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="LINKEDIN OR WEBSITE" hint="Optional">
                        <input value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://..." className={inputCls} style={inputStyle} />
                      </Field>
                      <Field label="LOCATION" hint="Optional">
                        <input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="San Francisco, CA" className={inputCls} style={inputStyle} />
                      </Field>
                    </div>
                    <Field label="WHY THEY DESERVE RECOGNITION *">
                      <textarea value={form.reason} onChange={(e) => update('reason', e.target.value)} rows={3} placeholder="Share their investment thesis, notable portfolio companies, or impact on the ecosystem…" className="w-full text-sm rounded-xl border p-3 bg-white outline-none resize-none" style={inputStyle} />
                    </Field>
                  </>
                )}

                {isLocal && (
                  <>
                    <Field label="BUSINESS NAME *">
                      <input value={form.business_name} onChange={(e) => update('business_name', e.target.value)} placeholder="Skyline Pilates & Wellness" className={inputCls} style={inputStyle} />
                    </Field>
                    <Field label="BUSINESS TYPE *">
                      <select value={form.business_type} onChange={(e) => update('business_type', e.target.value)} className={inputCls} style={inputStyle}>
                        <option value="">Select a category…</option>
                        {LOCAL_LEGEND_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="CITY / AEROSPACE HUB *">
                        <input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Huntsville, AL" className={inputCls} style={inputStyle} />
                      </Field>
                      <Field label="OWNER NAME" hint="Optional, if known">
                        <input value={form.owner_name} onChange={(e) => update('owner_name', e.target.value)} placeholder="Owner name" className={inputCls} style={inputStyle} />
                      </Field>
                    </div>
                    <Field label="WEBSITE / INSTAGRAM / LISTING" hint="Optional">
                      <input value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://..." className={inputCls} style={inputStyle} />
                    </Field>
                    <Field label="WHY THIS BUSINESS DESERVES A SPOTLIGHT *">
                      <textarea value={form.reason} onChange={(e) => update('reason', e.target.value)} rows={3} placeholder="What makes this spot special to the aerospace community?" className="w-full text-sm rounded-xl border p-3 bg-white outline-none resize-none" style={inputStyle} />
                    </Field>
                  </>
                )}

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
                    {isPerson ? 'Complete name, role, contribution, impact, and credit to submit.' : 'Complete all required fields to submit.'}
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