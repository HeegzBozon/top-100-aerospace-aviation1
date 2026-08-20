import { forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Plus, X } from 'lucide-react';
import { countWordsIn } from './profileWizardSteps';
import WizardHeadshot from './WizardHeadshot';

const B = {
  navy: '#1e3a5a',
  gold: '#c9a87c',
  cream: '#faf8f5',
  sand: '#f5f0e8',
  copper: '#b87333',
  muted: '#5d7a94',
  border: '#e8e0d4',
  rose: '#c87e9d',
};

const noAutofill = {
  autoComplete: 'off',
  'data-lpignore': 'true',
  'data-1p-ignore': true,
  'data-form-type': 'other',
};

const WizardField = forwardRef(function WizardField({ step, form, setForm, onCommit, clearError, onError }, ref) {
  const [tagDraft, setTagDraft] = useState('');
  const set = (val) => { setForm({ ...form, [step.key]: val }); clearError?.(); };

  // ── Headshot upload ──
  if (step.type === 'headshot') {
    return (
      <WizardHeadshot
        value={form[step.key] || ''}
        onChange={(url) => set(url)}
        onError={onError}
      />
    );
  }

  // ── Consent: two large editorial choices ──
  if (step.type === 'consent') {
    const val = form[step.key];
    const options = [
      { label: step.affirmative, value: true },
      { label: step.negative, value: false },
    ];
    return (
      <div className="space-y-3">
        {options.map((opt, i) => {
          const selected = val === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onCommit({ ...form, [step.key]: opt.value })}
              className="w-full flex items-center gap-3.5 p-4 rounded-xl text-left transition-all border-2 hover:scale-[1.01]"
              style={{ background: selected ? B.navy + '0a' : '#fff', borderColor: selected ? B.gold : B.border }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: selected ? B.gold : B.sand, color: B.navy }}
              >
                {i + 1}
              </span>
              <span className="text-sm font-medium" style={{ color: B.navy }}>{opt.label}</span>
              {selected && <Check className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: B.gold }} />}
            </button>
          );
        })}
      </div>
    );
  }

  // ── One Word: oversized letterpress input ──
  if (step.type === 'oneword') {
    const v = form[step.key] ?? '';
    return (
      <div>
        <Input
          ref={ref}
          {...noAutofill}
          name={`pw-${step.key}`}
          value={v}
          onChange={(e) => set(e.target.value.replace(/\s/g, ''))}
          placeholder={step.placeholder}
          className="h-20 border-0 border-b-2 rounded-none bg-transparent px-0 text-center"
          style={{
            borderBottomColor: B.gold,
            color: B.navy,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(30px, 8vw, 46px)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        />
        <p className="text-[11px] mt-2 text-center uppercase tracking-[0.18em]" style={{ color: B.muted }}>
          {v ? `${v.length} characters` : 'one word'}
        </p>
      </div>
    );
  }

  // ── Six Word Story: live word counter with six ticks ──
  if (step.type === 'sixword') {
    const v = form[step.key] ?? '';
    const n = countWordsIn(v);
    const exact = n === 6;
    return (
      <div>
        <Textarea
          ref={ref}
          {...noAutofill}
          name={`pw-${step.key}`}
          value={v}
          onChange={(e) => set(e.target.value)}
          placeholder={step.placeholder}
          rows={2}
          className="border-0 border-b-2 rounded-none bg-transparent px-0 resize-none text-center"
          style={{
            borderBottomColor: exact ? B.gold : B.border,
            color: B.navy,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(19px, 4.4vw, 26px)',
            lineHeight: 1.4,
          }}
        />
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: i < Math.min(n, 6) ? 26 : 16, background: i < Math.min(n, 6) ? B.gold : B.border }}
            />
          ))}
          <span
            className="ml-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: exact ? B.copper : n > 6 ? B.rose : B.muted }}
          >
            {exact ? 'exactly six' : `${n} / 6`}
          </span>
        </div>
      </div>
    );
  }

  // ── Tags ──
  if (step.type === 'tags') {
    const tags = Array.isArray(form[step.key]) ? form[step.key] : [];
    const max = step.max || 6;
    const addTag = () => {
      const t = tagDraft.trim();
      if (!t || tags.length >= max || tags.includes(t)) { setTagDraft(''); return; }
      set([...tags, t]);
      setTagDraft('');
    };
    return (
      <div>
        <div className="flex gap-2">
          <Input
            ref={ref}
            {...noAutofill}
            name={`pw-${step.key}`}
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); addTag(); }
            }}
            placeholder={step.placeholder}
            disabled={tags.length >= max}
            className="h-14 text-base border-0 border-b-2 rounded-none bg-transparent px-0"
            style={{ borderBottomColor: B.gold, color: B.navy }}
          />
          <button
            onClick={addTag}
            disabled={!tagDraft.trim() || tags.length >= max}
            className="w-12 h-14 flex items-center justify-center rounded-lg border-2 transition-colors disabled:opacity-40"
            style={{ borderColor: B.border, color: B.navy }}
            aria-label="Add discipline"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-medium"
              style={{ background: B.sand, color: B.navy, border: `1px solid ${B.border}` }}
            >
              {t}
              <button onClick={() => set(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                <X className="w-3 h-3" style={{ color: B.muted }} />
              </button>
            </span>
          ))}
        </div>
        <p className="text-[11px] mt-2 uppercase tracking-[0.16em]" style={{ color: B.muted }}>
          {tags.length} / {max} · press ↵ to add
        </p>
      </div>
    );
  }

  // ── Textarea ──
  if (step.type === 'textarea') {
    return (
      <Textarea
        ref={ref}
        {...noAutofill}
        name={`pw-${step.key}`}
        value={form[step.key] ?? ''}
        onChange={(e) => set(e.target.value)}
        placeholder={step.placeholder}
        rows={5}
        className="text-base border-0 border-b-2 rounded-none bg-transparent px-0 resize-none"
        style={{ borderBottomColor: B.gold, color: B.navy }}
      />
    );
  }

  // ── Default: text ──
  return (
    <Input
      ref={ref}
      {...noAutofill}
      name={`pw-${step.key}`}
      value={form[step.key] ?? ''}
      onChange={(e) => set(e.target.value)}
      placeholder={step.placeholder}
      className="text-lg h-14 border-0 border-b-2 rounded-none bg-transparent px-0"
      style={{ borderBottomColor: B.gold, color: B.navy }}
    />
  );
});

export default WizardField;
export { B as WIZARD_COLORS };