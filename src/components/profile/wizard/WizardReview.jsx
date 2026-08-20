import { ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WIZARD_COLORS as B } from './WizardField';

export default function WizardReview({ steps, form, saving, onBack, onEdit, onSubmit }) {
  const display = (s) => {
    const v = form[s.key];
    if (s.type === 'consent') return v === true ? s.affirmative : v === false ? s.negative : null;
    if (s.type === 'tags') return Array.isArray(v) && v.length ? v.join(' · ') : null;
    return v && String(v).trim() ? String(v) : null;
  };

  return (
    <div style={{ animation: 'pw-fwd 0.35s ease-out' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: B.gold }}>
        Final Look
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
        This is your record.
      </h2>
      <p className="text-sm mb-6" style={{ color: B.muted }}>
        Read it once as a stranger would. You can change any answer later.
      </p>

      {/* The two signature answers, set as editorial type */}
      {(form.one_word || form.six_word_story) && (
        <div className="rounded-2xl p-6 mb-5 text-center" style={{ background: B.navy }}>
          {form.one_word && (
            <p
              className="mb-3"
              style={{
                color: B.gold,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(26px, 7vw, 38px)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                lineHeight: 1.1,
              }}
            >
              {form.one_word}
            </p>
          )}
          {form.six_word_story && (
            <p
              style={{
                color: 'rgba(255,255,255,0.82)',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(15px, 3.6vw, 19px)',
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              &ldquo;{form.six_word_story}&rdquo;
            </p>
          )}
        </div>
      )}

      <div className="space-y-2.5">
        {steps.map((s, i) => {
          const val = display(s);
          if (val === null) return null;
          return (
            <button
              key={s.key}
              onClick={() => onEdit(i)}
              className="w-full text-left rounded-xl border p-3.5 transition-colors hover:bg-black/[0.02]"
              style={{ borderColor: B.border, background: '#fff' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
                  {s.question}
                </span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide" style={{ color: B.gold }}>
                  Edit
                </span>
              </div>
              <p className="text-sm" style={{ color: B.navy, whiteSpace: 'pre-wrap' }}>{val}</p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-7 mb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: B.muted }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:block" style={{ color: B.muted }}>↵ to confirm</span>
          <Button onClick={onSubmit} disabled={saving} className="flex items-center gap-1.5" style={{ background: B.navy, color: '#fff' }}>
            {saving ? 'Saving...' : 'Confirm my profile'}
            {saving ? <Sparkles className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}