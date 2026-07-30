import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, Loader2, Check, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  brand,
  combineGuidedReason,
  GUIDED_PROMPTS,
  LOCAL_LEGEND_TYPES,
} from '@/components/nominate/NominateConfig';

const SHARE_OPTIONS = [
  { value: 'yes', label: 'Yes, credit me' },
  { value: 'no', label: 'Keep it anonymous' },
];

export default function HubNominationCard({
  category,
  index,
  data,
  onChange,
  onRemove,
  onAddExisting,
  nominees,
  nominator,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isPerson = category.type === 'person';
  const isAngel = category.type === 'angel';
  const isLocal = category.type === 'local_legend';

  const update = (k, v) => {
    onChange(k, v);
    setSubmitted(false);
  };

  // Name autocomplete (person categories only)
  const matches =
    isPerson && data.name && data.name.trim().length > 1
      ? nominees
          .filter(
            (n) =>
              n.name?.toLowerCase().includes(data.name.toLowerCase()) &&
              n.name.toLowerCase() !== data.name.toLowerCase()
          )
          .slice(0, 5)
      : [];

  const selectExisting = (nominee) => {
    setShowSuggestions(false);
    onAddExisting(nominee);
    onChange('name', '');
    onChange('role_org', '');
    onChange('link', '');
    onChange('email', '');
    onChange('location', '');
    onChange('reason_contribution', '');
    onChange('reason_impact', '');
    onChange('reason_leadership', '');
    setSubmitted(false);
  };

  const canSubmit = (() => {
    if (isPerson) return data.name?.trim() && data.role_org?.trim() && data.reason_contribution?.trim() && data.reason_impact?.trim() && data.share_name;
    if (isAngel) return data.name?.trim() && data.investing_in?.trim() && data.reason?.trim() && data.share_name;
    if (isLocal) return data.business_name?.trim() && data.business_type?.trim() && data.city?.trim() && data.reason?.trim() && data.share_name;
    return false;
  })();

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const reason = isPerson ? combineGuidedReason(data) : data.reason?.trim() || '';

      if (isPerson || isAngel) {
        await base44.entities.NominationIntake.create({
          nomination_type: category.key,
          nominee_name: (data.name || '').trim(),
          role_org: (data.role_org || '').trim(),
          firm: isAngel ? (data.firm || '').trim() : '',
          link: (data.link || '').trim(),
          nominee_email: (data.email || '').trim(),
          location: (data.location || '').trim(),
          investing_in: isAngel ? (data.investing_in || '').trim() : '',
          reason,
          share_name: data.share_name,
          nominator_name: nominator?.full_name || '',
          nominator_email: nominator?.email || '',
          source: 'my_top100_hub',
          status: 'new',
        });
      } else if (isLocal) {
        await base44.entities.LocalLegendNomination.create({
          business_name: data.business_name.trim(),
          business_type: data.business_type,
          city: data.city.trim(),
          owner_name: (data.owner_name || '').trim(),
          link: (data.link || '').trim(),
          reason: data.reason.trim(),
          share_name: data.share_name,
          nominator_name: nominator?.full_name || '',
          nominator_email: nominator?.email || '',
          source: 'my_top100_hub',
          status: 'new',
        });
      }

      base44.analytics.track({
        eventName: 'hub_nomination_submitted',
        properties: { category: category.key },
      });
      setSubmitted(true);
    } catch (e) {
      console.warn('Hub nomination failed', e);
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const inputCls = 'w-full text-sm rounded-xl border p-3 bg-white outline-none transition-colors';
  const inputStyle = { borderColor: `${brand.navy}15`, color: brand.navy };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'white', border: `1px solid ${brand.navy}10` }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${brand.navy}08` }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: `${brand.navy}50` }}>
          Nomination {index + 1}
        </span>
        <div className="flex items-center gap-2">
          {submitted && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: '#2d8a4f' }}>
              <Check className="w-3 h-3" /> Submitted
            </span>
          )}
          <button
            onClick={onRemove}
            className="h-7 w-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: `${brand.navy}05` }}
          >
            <Trash2 className="w-3.5 h-3.5" style={{ color: '#c0392b' }} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isPerson && (
          <>
            <Field label={`${category.pronoun.toUpperCase().slice(0, category.pronoun.length - 1)} NAME *`} pronoun={category.pronoun}>
              <div className="relative">
                <input
                  value={data.name || ''}
                  onChange={(e) => { update('name', e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={`Search for ${category.pronoun}, or type a new name`}
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

            <Field label={`${category.pronoun[0].toUpperCase()}${category.pronoun.slice(1, -1)} CURRENT ROLE AND ORGANIZATION *`} hint="As specific as you can. Helps us find them.">
              <input
                value={data.role_org || ''}
                onChange={(e) => update('role_org', e.target.value)}
                placeholder="e.g. Propulsion Engineer at Blue Origin"
                className={inputCls}
                style={inputStyle}
              />
            </Field>

            <Field label="LINKEDIN OR WEBSITE" hint="Optional but helpful">
              <input
                value={data.link || ''}
                onChange={(e) => update('link', e.target.value)}
                placeholder="https://..."
                className={inputCls}
                style={inputStyle}
              />
            </Field>

            <Field label="EMAIL" hint="Optional">
              <input
                type="email"
                value={data.email || ''}
                onChange={(e) => update('email', e.target.value)}
                placeholder="name@example.com"
                className={inputCls}
                style={inputStyle}
              />
            </Field>

            <Field label="LOCATION" hint="Optional">
              <input
                value={data.location || ''}
                onChange={(e) => update('location', e.target.value)}
                placeholder="Houston, TX"
                className={inputCls}
                style={inputStyle}
              />
            </Field>

            {/* Guided prompts */}
            {GUIDED_PROMPTS.map((p) => (
              <div key={p.key}>
                <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wide" style={{ color: `${brand.navy}70` }}>
                  {p.label}
                </label>
                <textarea
                  value={data[p.key] || ''}
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
              <input value={data.name || ''} onChange={(e) => update('name', e.target.value)} placeholder="Jane Doe" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="FIRM / FUND">
              <input value={data.firm || ''} onChange={(e) => update('firm', e.target.value)} placeholder="Starbridge Capital" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="INVESTING IN *" hint="What sectors / stages do they back?">
              <input value={data.investing_in || ''} onChange={(e) => update('investing_in', e.target.value)} placeholder="Seed-stage space startups, aviation mobility" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="LINKEDIN OR WEBSITE" hint="Optional">
              <input value={data.link || ''} onChange={(e) => update('link', e.target.value)} placeholder="https://..." className={inputCls} style={inputStyle} />
            </Field>
            <Field label="LOCATION" hint="Optional">
              <input value={data.location || ''} onChange={(e) => update('location', e.target.value)} placeholder="San Francisco, CA" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="WHY THEY DESERVE RECOGNITION *">
              <textarea value={data.reason || ''} onChange={(e) => update('reason', e.target.value)} rows={3} placeholder="Share their investment thesis, notable portfolio companies, or impact on the ecosystem…" className="w-full text-sm rounded-xl border p-3 bg-white outline-none resize-none" style={inputStyle} />
            </Field>
          </>
        )}

        {isLocal && (
          <>
            <Field label="BUSINESS NAME *">
              <input value={data.business_name || ''} onChange={(e) => update('business_name', e.target.value)} placeholder="Skyline Pilates & Wellness" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="BUSINESS TYPE *">
              <select value={data.business_type || ''} onChange={(e) => update('business_type', e.target.value)} className={inputCls} style={inputStyle}>
                <option value="">Select a category…</option>
                {LOCAL_LEGEND_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="CITY / AEROSPACE HUB *">
              <input value={data.city || ''} onChange={(e) => update('city', e.target.value)} placeholder="Huntsville, AL" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="OWNER NAME" hint="Optional, if known">
              <input value={data.owner_name || ''} onChange={(e) => update('owner_name', e.target.value)} placeholder="Owner name" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="WEBSITE / INSTAGRAM / LISTING" hint="Optional">
              <input value={data.link || ''} onChange={(e) => update('link', e.target.value)} placeholder="https://..." className={inputCls} style={inputStyle} />
            </Field>
            <Field label="WHY THIS BUSINESS DESERVES A SPOTLIGHT *">
              <textarea value={data.reason || ''} onChange={(e) => update('reason', e.target.value)} rows={3} placeholder="What makes this spot special to the aerospace community?" className="w-full text-sm rounded-xl border p-3 bg-white outline-none resize-none" style={inputStyle} />
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
                  background: data.share_name === opt.value ? brand.navy : 'white',
                  color: data.share_name === opt.value ? 'white' : `${brand.navy}70`,
                  borderColor: data.share_name === opt.value ? brand.navy : `${brand.navy}15`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs font-medium" style={{ color: '#c0392b' }}>{error}</p>}
      </div>

      {/* Submit footer */}
      <div className="px-4 py-3" style={{ borderTop: `1px solid ${brand.navy}08`, background: brand.cream }}>
        <motion.button
          whileTap={{ scale: canSubmit && !submitted ? 0.97 : 1 }}
          onClick={handleSubmit}
          disabled={!canSubmit || submitting || submitted}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background: submitted
              ? `${brand.gold}30`
              : canSubmit
              ? `linear-gradient(135deg, ${brand.navy}, #0b2542)`
              : `${brand.navy}15`,
            color: submitted ? brand.navy : 'white',
          }}
        >
          {submitted ? (
            <><Check className="w-4 h-4" /> Submitted for review</>
          ) : submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Nomination</>
          )}
        </motion.button>
      </div>
    </motion.div>
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