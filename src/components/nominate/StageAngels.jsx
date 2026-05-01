import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Check, Trash2, SkipForward, TrendingUp } from 'lucide-react';
import { brand } from './NominateConfig';
import CategoryHeader from './CategoryHeader';
import HubMeter from './HubMeter';

export default function StageAngels({ nominations, onAdd, onUpdate, onRemove, onNext, onSkip }) {
  const firstRef = useRef(null);
  useEffect(() => { setTimeout(() => firstRef.current?.focus(), 200); }, []);

  return (
    <div className="space-y-6 py-4">
      <CategoryHeader
        stageNumber={3}
        categoryLabel="TOP 100 Angels"
        accentColor="#8b6f47"
        icon={TrendingUp}
        title="Do you know an investor who is backing the future of aerospace, aviation, or space?"
        intro="TOP 100 Angels in Aerospace & Aviation recognizes the investors, angels, and capital allocators who are funding the next era of flight. Pre-seed to growth stage. Institutional to individual. If they're putting money behind this industry, they deserve to be known."
      />

      <HubMeter count={nominations.length} label="angels" />

      {nominations.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: `${brand.navy}20` }}>
          <p className="text-sm mb-4" style={{ color: `${brand.navy}60` }}>No Angel nominations yet.</p>
          <Button onClick={onAdd} className="rounded-full gap-2 cursor-pointer text-white" style={{ background: brand.navy }}>
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
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: brand.gold }}>Angel {idx + 1}</span>
              <button onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 cursor-pointer p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <Field label="Their name" required>
              <Input ref={idx === nominations.length - 1 ? firstRef : null} value={nom.name} onChange={e => onUpdate(idx, 'name', e.target.value)} className="bg-white h-11" />
            </Field>
            <Field label="Their firm or investment vehicle" hint="If applicable">
              <Input value={nom.firm} onChange={e => onUpdate(idx, 'firm', e.target.value)} className="bg-white h-11" />
            </Field>
            <Field label="LinkedIn or website" hint="Optional but helpful">
              <Input value={nom.link} onChange={e => onUpdate(idx, 'link', e.target.value)} className="bg-white h-11" />
            </Field>
            <Field label="City / Country">
              <Input value={nom.location} onChange={e => onUpdate(idx, 'location', e.target.value)} className="bg-white h-11" />
            </Field>
            <Field label="What are they investing in?" required hint="A sentence or two. Stage, focus area, notable bets if you know them.">
              <Textarea value={nom.investing_in} onChange={e => onUpdate(idx, 'investing_in', e.target.value)} rows={2} className="bg-white" />
            </Field>
            <Field label="Why do they deserve to be recognized?" required>
              <Textarea value={nom.reason} onChange={e => onUpdate(idx, 'reason', e.target.value)} rows={2} className="bg-white" />
            </Field>
            <Field label="May we tell them you nominated them?" required>
              <ChoiceGroup
                value={nom.share_name}
                onChange={v => onUpdate(idx, 'share_name', v)}
                options={[
                  { val: 'yes', label: 'Yes, share my name with them' },
                  { val: 'no', label: 'No, keep my nomination anonymous' },
                ]}
              />
            </Field>
          </motion.div>
        ))}
      </AnimatePresence>

      {nominations.length > 0 && (
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed text-sm font-semibold cursor-pointer"
          style={{ borderColor: `${brand.gold}60`, color: brand.gold }}
        >
          <Plus className="w-4 h-4" /> Nominate another Angel
        </button>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <button onClick={onSkip} className="text-sm font-medium flex items-center gap-1.5 cursor-pointer order-2 sm:order-1" style={{ color: `${brand.navy}55` }}>
          <SkipForward className="w-3.5 h-3.5" /> Skip this category
        </button>
        <Button
          onClick={onNext}
          size="lg"
          className="rounded-full px-7 py-5 text-sm text-white gap-2 cursor-pointer shadow-lg order-1 sm:order-2 w-full sm:w-auto"
          style={{ background: brand.navy }}
        >
          {nominations.length > 0 ? <>Save & Continue <Check className="w-4 h-4" /></> : <>Next: Local Legends <ArrowRight className="w-4 h-4" /></>}
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