import { B } from '@/components/fellow-home/fellowHomeConfig';
import {
  MODES,
  CAPABILITY_LABELS,
  OFFERING_LABELS,
  REGION_LABELS,
  DISCIPLINE_LABELS,
  WORK_PREFERENCES,
  availabilityOption,
} from './intentConfig';

// One door, drawn as an editorial plate: the state of the door, the Fellow's own
// words about what they want next, and the curated list of what they bring. The
// call to action is the whole point of the plate, so it sits at its foot, full width.
export default function OpportunityPanel({ mode, settings, onEnquire, onDossier }) {
  const spec = MODES[mode];
  const state = availabilityOption(mode, settings?.[spec.availabilityField]);
  const pitch = settings?.[spec.pitchField] || '';
  const keys = settings?.[spec.optionsField] || [];
  const labels = (mode === 'hire' ? CAPABILITY_LABELS : OFFERING_LABELS);
  const chips = keys.map((key) => labels[key]).filter(Boolean);

  const detail =
    mode === 'hire'
      ? [
          WORK_PREFERENCES.find((w) => w.key === settings?.hire_work_preference)?.label,
          ...(settings?.hire_regions || []).map((key) => REGION_LABELS[key]).filter(Boolean),
        ].filter(Boolean)
      : (settings?.commercial_sectors || []).map((key) => DISCIPLINE_LABELS[key]).filter(Boolean);

  return (
    <article
      className="flex flex-col rounded-2xl p-6 sm:p-7"
      style={{
        background: 'rgba(255,255,255,0.9)',
        border: `1px solid ${mode === 'hire' ? 'rgba(184,115,51,0.28)' : 'rgba(201,168,124,0.45)'}`,
        boxShadow: '0 18px 44px -30px rgba(7,17,31,0.45)',
      }}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
        {spec.kicker}
      </p>
      <h3
        className="mt-1.5 text-2xl font-semibold leading-tight"
        style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {spec.label}
      </h3>

      {state && (
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: state.key === 'closed' || state.key === 'not_looking' ? B.muted : B.copper }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.navy }}>
            {state.label}
          </span>
          <span className="text-[11px]" style={{ color: B.muted }}>{state.note}</span>
        </div>
      )}

      {pitch && (
        <p
          className="mt-4 text-[15px] leading-relaxed"
          style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {pitch}
        </p>
      )}

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full px-2.5 py-1 text-[10.5px] font-medium"
              style={{ background: 'rgba(30,58,90,0.06)', color: B.navy, border: `1px solid ${B.border}` }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {detail.length > 0 && (
        <p className="mt-3 text-[11px]" style={{ color: B.muted }}>
          {detail.join('  ·  ')}
        </p>
      )}

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={() => onEnquire(mode, mode === 'hire' ? 'role_conversation' : 'introduction')}
          className="w-full rounded-full py-3 text-[12px] font-bold uppercase tracking-[0.16em] transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: B.copper, color: '#fff' }}
        >
          {spec.cta}
        </button>
        <button
          type="button"
          onClick={() => onEnquire(mode, 'dossier')}
          className="mt-2 w-full rounded-full py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
          style={{ color: B.navy, border: `1px solid ${B.border}` }}
        >
          Ask for the dossier
        </button>
      </div>
    </article>
  );
}