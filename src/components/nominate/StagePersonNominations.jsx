import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Plus, Check, Trash2, SkipForward } from 'lucide-react';
import { brand, GUIDED_PROMPTS } from './NominateConfig';
import CategoryHeader from './CategoryHeader';
import HubMeter from './HubMeter';
import ImpactMeter from './ImpactMeter';

/**
 * Generic stage for TOP 100 Women / Men.
 * Same fields, different copy (props).
 */
export default function StagePersonNominations({
  title,
  intro,
  pronoun, // 'her' or 'him'
  pronounSubject, // 'she' or 'he'
  addLabel,
  nextLabel,
  nominations,
  onAdd,
  onUpdate,
  onRemove,
  onNext,
  onSkip,
  onPrev,
  prevLabel,
  onNavigate,
  stageNumber,
  categoryLabel,
  accentColor,
  icon,
}) {
  const firstRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(nominations.length > 0 ? nominations.length - 1 : -1);

  useEffect(() => { setTimeout(() => firstRef.current?.focus(), 200); }, []);

  const handleAdd = () => {
    onAdd();
    setActiveIdx(nominations.length); // will be the new index
  };

  const handleRemove = (idx) => {
    onRemove(idx);
    setActiveIdx(Math.max(0, idx - 1));
  };

  return (
    <div className="space-y-6 py-4">
      <CategoryHeader
        stageNumber={stageNumber}
        categoryLabel={categoryLabel}
        accentColor={accentColor}
        icon={icon}
        title={title}
        intro={intro}
        onNavigate={onNavigate}
      />

      <HubMeter count={nominations.length} label="nominations" />

      {nominations.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: `${brand.navy}20` }}>
          <p className="text-sm mb-4" style={{ color: `${brand.navy}60` }}>No nominations yet for this category.</p>
          <Button
            onClick={() => { handleAdd(); }}
            className="rounded-full gap-2 cursor-pointer text-white"
            style={{ background: brand.navy }}
          >
            <Plus className="w-4 h-4" /> Start a nomination
          </Button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {nominations.map((nom, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-[1.75rem] border bg-white/85 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-[0_18px_70px_rgba(30,58,90,0.08)]"
            style={{ borderColor: `${brand.navy}10` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: brand.gold }}>
                Nomination {idx + 1}
              </span>
              <button onClick={() => handleRemove(idx)} className="text-red-400 hover:text-red-600 cursor-pointer p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <Field label={`${capitalize(pronoun === 'her' ? 'her' : 'his')} name`} required>
              <Input
                ref={idx === activeIdx ? firstRef : null}
                value={nom.name}
                onChange={e => onUpdate(idx, 'name', e.target.value)}
                placeholder="Full name"
                className="bg-white h-11"
              />
            </Field>

            <Field label={`${capitalize(pronoun === 'her' ? 'her' : 'his')} current role and organization`} required hint="As specific as you can. Helps us find them.">
              <Input value={nom.role_org} onChange={e => onUpdate(idx, 'role_org', e.target.value)} placeholder="e.g. Propulsion Engineer at Blue Origin" className="bg-white h-11" />
            </Field>

            <Field label="LinkedIn or website" hint="Optional but helpful">
              <Input value={nom.link} onChange={e => onUpdate(idx, 'link', e.target.value)} placeholder="https://..." className="bg-white h-11" />
            </Field>

            <Field label="Email" hint="Optional">
              <Input type="email" value={nom.email || ''} onChange={e => onUpdate(idx, 'email', e.target.value)} placeholder="name@example.com" className="bg-white h-11" />
            </Field>

            <Field label="City / Country">
              <Input value={nom.location} onChange={e => onUpdate(idx, 'location', e.target.value)} placeholder="e.g. Houston, USA" className="bg-white h-11" />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${brand.navy}70` }}>
                  Why does {pronounSubject} deserve to be recognized?<span style={{ color: brand.gold }}> *</span>
                </label>
                <ImpactMeter text={`${nom.reason_contribution || ''} ${nom.reason_impact || ''} ${nom.reason_leadership || ''}`} />
              </div>
              <div className="space-y-3">
                {GUIDED_PROMPTS.map((p) => (
                  <div key={p.key}>
                    <p className="text-[11px] font-medium mb-1" style={{ color: `${brand.navy}55` }}>{p.label}</p>
                    <Textarea
                      value={nom[p.key] || ''}
                      onChange={e => onUpdate(idx, p.key, e.target.value)}
                      rows={2}
                      className="bg-white text-sm"
                      placeholder="A sentence or two…"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Field label={`May we tell ${pronoun} you nominated ${pronoun}?`} required>
              <ChoiceGroup
                value={nom.share_name}
                onChange={(v) => onUpdate(idx, 'share_name', v)}
                options={[
                  { val: 'yes', label: `Yes, share my name with ${pronoun}` },
                  { val: 'no', label: 'No, keep my nomination anonymous' },
                ]}
              />
            </Field>
          </motion.div>
        ))}
      </AnimatePresence>

      {nominations.length > 0 && (
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed text-sm font-semibold cursor-pointer"
          style={{ borderColor: `${brand.gold}60`, color: brand.gold }}
        >
          <Plus className="w-4 h-4" /> {addLabel}
        </button>
      )}

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <div className="flex items-center gap-4 order-2 sm:order-1">
          {onPrev && (
            <button onClick={onPrev} className="text-sm font-medium flex items-center gap-1.5 cursor-pointer" style={{ color: `${brand.navy}55` }}>
              <ArrowLeft className="w-3.5 h-3.5" /> {prevLabel}
            </button>
          )}
          <button onClick={onSkip} className="text-sm font-medium flex items-center gap-1.5 cursor-pointer" style={{ color: `${brand.navy}55` }}>
            <SkipForward className="w-3.5 h-3.5" /> Skip
          </button>
        </div>
        <Button
          onClick={onNext}
          size="lg"
          className="rounded-full px-7 py-5 text-sm text-white gap-2 cursor-pointer shadow-lg order-1 sm:order-2 w-full sm:w-auto"
          style={{ background: brand.navy }}
        >
          {nominations.length > 0 ? <>Save & Continue <Check className="w-4 h-4" /></> : <>{nextLabel} <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: `${brand.navy}70` }}>
        {label}{required && <span style={{ color: brand.gold }}> *</span>}
      </label>
      {hint && <p className="text-[11px] mb-1.5" style={{ color: `${brand.navy}45` }}>{hint}</p>}
      {children}
    </div>
  );
}

function ChoiceGroup({ value, onChange, options }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <button
          key={opt.val}
          onClick={() => onChange(opt.val)}
          className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all cursor-pointer ${
            value === opt.val ? 'border-[#c9a87c] bg-[#c9a87c]/8' : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/25 bg-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }