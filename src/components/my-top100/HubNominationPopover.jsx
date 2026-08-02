import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Check, Search, ArrowRight, ArrowLeft, CornerDownLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import {
  brand,
  combineGuidedReason,
  GUIDED_PROMPTS,
  emptyPersonNomination,
} from '@/components/nominate/NominateConfig';


const SHARE_OPTIONS = [
  { value: 'yes', label: 'Yes, credit me', sub: 'Your name shows on the nomination.' },
  { value: 'no', label: 'Keep it anonymous', sub: 'We will keep your name private.' },
];

const PRIMARY_CATEGORIES = [
  { value: 'women', label: 'Women', sub: 'Women in aerospace & aviation' },
  { value: 'men', label: 'Men', sub: 'Men in aerospace & aviation' },
];

const YESNO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

function celebrate() {
  try {
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.75 }, colors: ['#c9a87c', '#1e3a5a', '#e8d9c3'] });
    setTimeout(() => confetti({ particleCount: 45, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#c9a87c', '#1e3a5a'] }), 140);
    setTimeout(() => confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#c9a87c', '#1e3a5a'] }), 280);
  } catch (e) { /* noop */ }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.085;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      o.start(t);
      o.stop(t + 0.25);
    });
    setTimeout(() => ctx.close(), 700);
  } catch (e) { /* noop */ }
}

const STEPS = [
  'category',
  'name',
  'contact',
  'contribution',
  'impact',
  'leadership',
  'credit',
  'angels',
  'review',
];

const STEP_META = {
  category: { q: 'Who are you nominating?', hint: 'Pick a track. You can add them as an Angel too, later.' },
  name: { q: "What's their name?", hint: 'Search the verified directory — or type a new name.' },
  contact: { q: 'How can we find them?', hint: 'Optional — but it helps us verify.' },
  contribution: { q: 'What is their primary contribution?', hint: 'Optional — one specific example beats ten adjectives.' },
  impact: { q: 'How have they impacted others in the field?', hint: 'Optional — think people, programs, or culture.' },
  leadership: { q: 'What makes their approach or leadership unique?', hint: 'Optional — but this is what separates them.' },
  credit: { q: 'Want the credit?', hint: 'We will show your name unless you say otherwise.' },
  angels: { q: 'Also recognize them as an Angel investor?', hint: 'They will appear in both their main tab and Angels.' },
  review: { q: 'Ready to submit?', hint: 'Take one last look.' },
};

export default function HubNominationPopover({ onClose, onSubmitted, nominees, nominator, initialNominee }) {
  const [form, setForm] = useState(emptyPersonNomination);
  const [nominationCategory, setNominationCategory] = useState('women');
  const [alsoAngels, setAlsoAngels] = useState('no');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  const activeRef = useRef(null);
  const stepId = STEPS[step];

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Pre-fill from a browse-list nominee (skips the category/name/contact steps)
  useEffect(() => {
    if (!initialNominee) return;
    setSelectedNominee(initialNominee);
    setForm({
      ...emptyPersonNomination(),
      name: initialNominee.name || '',
      role_org: [initialNominee.title || initialNominee.professional_role, initialNominee.company || initialNominee.organization].filter(Boolean).join(' · '),
      link: initialNominee.linkedin_profile_url || initialNominee.website_url || '',
      email: initialNominee.nominee_email || '',
      location: initialNominee.country || '',
    });
    const t = `${initialNominee.description || ''} ${initialNominee.industry || ''} ${initialNominee.category || ''}`.toLowerCase();
    if (t.includes('woman') || t.includes('female')) setNominationCategory('women');
    else setNominationCategory('men');
    setStep(STEPS.indexOf('contribution'));
  }, [initialNominee]);

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

  const canSubmit = form.name?.trim() && form.share_name;

  const canAdvance = useCallback(
    (id) => {
      switch (id) {
        case 'name': return !!form.name?.trim();
        case 'credit': return !!form.share_name;
        default: return true;
      }
    },
    [form]
  );

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
      if (alsoAngels === 'yes') {
        await base44.entities.NominationIntake.create({ ...baseIntake, nomination_type: 'angels' });
      }
      base44.analytics.track({ eventName: 'hub_nomination_submitted', properties: { category: nominationCategory, also_angels: alsoAngels === 'yes', existing: !!selectedNominee } });
      if (selectedNominee) {
        onSubmitted({ existing: true, nominee: selectedNominee, category: nominationCategory, also_angels: alsoAngels === 'yes' });
      } else {
        onSubmitted({ existing: false, summary: { ...form, category: nominationCategory, also_angels: alsoAngels === 'yes' }, category: nominationCategory, also_angels: alsoAngels === 'yes' });
      }
      celebrate();
      setDone(true);
    } catch (e) {
      console.warn('Hub nomination failed', e);
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const goNext = useCallback(() => {
    if (done || submitting) return;
    if (step < STEPS.length - 1) {
      if (!canAdvance(STEPS[step])) return;
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  }, [step, done, submitting, canAdvance]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  // Keyboard controls — keep latest handlers in refs so the listener stays stable
  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;
  const goBackRef = useRef(goBack);
  goBackRef.current = goBack;
  const selectChoiceRef = useRef(() => {});
  selectChoiceRef.current = (value) => {
    if (stepId === 'category') setNominationCategory(value);
    else if (stepId === 'credit') update('share_name', value);
    else if (stepId === 'angels') setAlsoAngels(value);
    setTimeout(() => goNextRef.current(), 120);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      const tag = (e.target?.tagName || '').toLowerCase();
      const isChoice = stepId === 'category' || stepId === 'credit' || stepId === 'angels';
      if (e.key === 'Enter') {
        if (tag === 'textarea' && !e.metaKey && !e.ctrlKey) return;
        e.preventDefault();
        goNextRef.current();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNextRef.current();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBackRef.current();
      } else if (isChoice && (e.key === '1' || e.key === '2')) {
        const opts = stepId === 'category' ? PRIMARY_CATEGORIES : YESNO;
        const idx = Number(e.key) - 1;
        if (opts[idx]) {
          e.preventDefault();
          selectChoiceRef.current(opts[idx].value);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepId, onClose]);

  // Focus the active input when the step changes
  useEffect(() => {
    const t = setTimeout(() => {
      if (activeRef.current && typeof activeRef.current.focus === 'function') activeRef.current.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [step]);

  const progress = ((step + 1) / STEPS.length) * 100;
  const inputCls = 'w-full text-base rounded-2xl border p-4 bg-white outline-none transition-colors';
  const inputStyle = { borderColor: `${brand.navy}15`, color: brand.navy };
  const meta = STEP_META[stepId] || {};
  const blocked = !canAdvance(stepId) && step < STEPS.length - 1;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
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
          className="relative w-full sm:max-w-xl max-h-[95vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{ background: brand.cream, boxShadow: '0 -10px 40px rgba(10,18,30,0.3)' }}
        >
          {done ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b8884a)` }}>
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                Nomination submitted
              </h3>
              <p className="text-xs leading-relaxed max-w-xs mb-5" style={{ color: `${brand.navy}60` }}>
                Your nomination for {form.name} is in review. Once approved, they will appear in the verified directory.
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
              {/* Header: progress + close */}
              <div className="px-4 pt-3 pb-2 shrink-0" style={{ background: 'white' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: `${brand.navy}50` }}>
                    New Nomination · {step + 1} / {STEPS.length}
                  </p>
                  <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${brand.navy}08` }}>
                    <X className="w-4 h-4" style={{ color: brand.navy }} />
                  </button>
                </div>
                <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: `${brand.navy}10` }}>
                  <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${brand.gold}, ${brand.navy})` }} animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} />
                </div>
              </div>

              {/* Step body */}
              <div className="overflow-y-auto px-6 py-6 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stepId}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.22 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold mb-1 leading-tight" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {meta.q}
                    </h2>
                    {meta.hint && <p className="text-xs mb-5" style={{ color: `${brand.navy}50` }}>{meta.hint}</p>}

                    {stepId === 'category' && (
                      <ChoiceList options={PRIMARY_CATEGORIES} value={nominationCategory} onPick={(v) => selectChoiceRef.current(v)} />
                    )}

                    {stepId === 'name' && (
                      <div>
                        <div className="relative">
                          <input
                            ref={activeRef}
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
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: `${brand.navy}30` }} />
                        </div>

                        {showSuggestions && matches.length > 0 && (
                          <div className="mt-2 rounded-xl overflow-hidden" style={{ background: 'white', border: `1px solid ${brand.navy}15` }}>
                            {matches.map((n, i) => (
                              <button
                                key={n.id}
                                onMouseDown={(e) => { e.preventDefault(); selectExisting(n); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#f9f7f4] transition-colors"
                                style={i < matches.length - 1 ? { borderBottom: `1px solid ${brand.navy}08` } : undefined}
                              >
                                <div className="h-9 w-9 rounded-full overflow-hidden shrink-0" style={{ background: `${brand.navy}08` }}>
                                  {(n.photo_url || n.avatar_url) ? (
                                    <img src={n.photo_url || n.avatar_url} alt={n.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs font-bold" style={{ color: brand.navy }}>
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
                                <span className="text-[9px] font-bold uppercase shrink-0 px-2 py-1 rounded-full" style={{ background: `${brand.gold}15`, color: brand.gold }}>Add</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedNominee && (
                          <div className="flex items-center gap-1.5 text-[11px] mt-3" style={{ color: '#2d8a4f' }}>
                            <Check className="w-3.5 h-3.5" /> Pre-filled from an existing profile — review the questions and submit
                          </div>
                        )}
                      </div>
                    )}

                    {stepId === 'contact' && (
                      <div className="space-y-3">
                        <input ref={activeRef} value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="LinkedIn or website (https://…)" className={inputCls} style={inputStyle} />
                        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email (optional)" className={inputCls} style={inputStyle} />
                      </div>
                    )}

                    {(stepId === 'contribution' || stepId === 'impact' || stepId === 'leadership') && (
                      (() => {
                        const key = stepId === 'contribution' ? 'reason_contribution' : stepId === 'impact' ? 'reason_impact' : 'reason_leadership';
                        return (
                          <textarea
                            ref={activeRef}
                            value={form[key]}
                            onChange={(e) => update(key, e.target.value)}
                            rows={4}
                            placeholder="Share a specific example…"
                            className="w-full text-base rounded-2xl border p-4 bg-white outline-none resize-none"
                            style={inputStyle}
                          />
                        );
                      })()
                    )}

                    {stepId === 'credit' && (
                      <ChoiceList options={SHARE_OPTIONS} value={form.share_name} onPick={(v) => selectChoiceRef.current(v)} />
                    )}

                    {stepId === 'angels' && (
                      <ChoiceList options={YESNO} value={alsoAngels} onPick={(v) => selectChoiceRef.current(v)} />
                    )}

                    {stepId === 'review' && (
                      <ReviewSummary form={form} nominationCategory={nominationCategory} alsoAngels={alsoAngels === 'yes'} selectedNominee={selectedNominee} />
                    )}

                    {error && <p className="text-xs font-medium mt-4" style={{ color: '#c0392b' }}>{error}</p>}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer: nav controls */}
              <div className="px-4 py-3 shrink-0 flex items-center gap-2" style={{ borderTop: `1px solid ${brand.navy}10`, background: 'white' }}>
                {step > 0 && (
                  <button onClick={goBack} className="h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center" style={{ background: `${brand.navy}08` }} aria-label="Back">
                    <ArrowLeft className="w-4 h-4" style={{ color: brand.navy }} />
                  </button>
                )}
                {stepId === 'review' ? (
                  <motion.button
                    whileTap={{ scale: canSubmit ? 0.97 : 1 }}
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-bold transition-all"
                    style={{ background: canSubmit ? `linear-gradient(135deg, ${brand.navy}, #0b2542)` : `${brand.navy}15`, color: 'white' }}
                  >
                    {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>) : (<><Send className="w-4 h-4" /> Submit Nomination</>)}
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: blocked ? 1 : 0.97 }}
                    onClick={goNext}
                    disabled={blocked}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-sm font-bold transition-all"
                    style={{ background: blocked ? `${brand.navy}15` : `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}
                  >
                    {blocked ? 'Fill this in to continue' : (<>Continue <ArrowRight className="w-4 h-4" /></>)}
                  </motion.button>
                )}
              </div>

              <p className="text-center text-[10px] pb-2" style={{ color: `${brand.navy}40`, background: 'white' }}>
                <CornerDownLeft className="inline w-3 h-3 mr-1" /> Enter to continue · ← → to navigate · Esc to close
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function ChoiceList({ options, value, onPick }) {
  return (
    <div className="space-y-2.5">
      {options.map((opt, i) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPick(opt.value)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all"
            style={{
              background: active ? brand.navy : 'white',
              color: active ? 'white' : brand.navy,
              borderColor: active ? brand.navy : `${brand.navy}15`,
            }}
          >
            <span className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: active ? 'rgba(255,255,255,0.15)' : `${brand.navy}08`, color: active ? 'white' : `${brand.navy}60` }}>
              {i + 1}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold">{opt.label}</span>
              {opt.sub && <span className="block text-[11px]" style={{ color: active ? 'rgba(255,255,255,0.7)' : `${brand.navy}50` }}>{opt.sub}</span>}
            </span>
            {active && <Check className="w-4 h-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

function ReviewSummary({ form, nominationCategory, alsoAngels, selectedNominee }) {
  const rows = [
    ['Track', nominationCategory ? nominationCategory.charAt(0).toUpperCase() + nominationCategory.slice(1) : '—'],
    ['Name', form.name || '—'],
    ['Role / Org', form.role_org || '—'],
    ['Link', form.link || '—'],
    ['Email', form.email || '—'],
    ['Location', form.location || '—'],
    ['Primary contribution', form.reason_contribution || '—'],
    ['Impact', form.reason_impact || '—'],
    ['Leadership', form.reason_leadership || '—'],
    ['Credit', form.share_name === 'yes' ? 'Credited' : form.share_name === 'no' ? 'Anonymous' : '—'],
    ['Also Angels', alsoAngels ? 'Yes' : 'No'],
  ];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${brand.navy}15`, background: 'white' }}>
      {rows.map((r, i) => (
        <div key={r[0]} className="flex items-start gap-3 px-4 py-2.5" style={{ borderBottom: i < rows.length - 1 ? `1px solid ${brand.navy}08` : 'none' }}>
          <span className="w-32 shrink-0 text-[10px] font-bold uppercase tracking-wide pt-0.5" style={{ color: `${brand.navy}50` }}>{r[0]}</span>
          <span className="flex-1 text-xs whitespace-pre-wrap" style={{ color: brand.navy }}>{r[1]}</span>
        </div>
      ))}
    </div>
  );
}