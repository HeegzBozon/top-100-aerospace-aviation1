import { Camera, PenLine, ArrowRight, Check } from 'lucide-react';
import { WIZARD_COLORS as B } from './WizardField';
import { SITTINGS, SITTING_FIELDS, countFilled } from './sittings';

const ICONS = { photographer: Camera, biographer: PenLine };

// The lobby: two appointments waiting. Sit for one, or walk both in order.
export default function SittingSelect({ form, onBegin }) {
  return (
    <div className="pb-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: B.gold }}>
        Two Sittings
      </p>
      <h2
        className="text-[27px] sm:text-[31px] font-bold leading-tight mb-2"
        style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Your profile is made by two hands.
      </h2>
      <p className="text-sm mb-6" style={{ color: B.muted }}>
        One takes the portrait. One takes the record. Sit with either, or walk the whole studio.
      </p>

      <div className="space-y-3">
        {SITTINGS.map((s) => {
          const Icon = ICONS[s.id];
          const fields = SITTING_FIELDS[s.id];
          const filled = countFilled(fields, form);
          const complete = filled === fields.length;
          return (
            <button
              key={s.id}
              onClick={() => onBegin([s.id])}
              className="group w-full text-left p-5 rounded-2xl border transition-all hover:shadow-md"
              style={{ background: '#fff', borderColor: B.border }}
            >
              <div className="flex items-start gap-4">
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: B.sand, color: B.navy }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: B.gold }}>
                      {s.chapter}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: B.muted }}>
                      {s.minutes}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-bold leading-snug mt-0.5"
                    style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {s.name}
                  </h3>
                  <p className="text-[13px] leading-relaxed mt-1" style={{ color: B.muted }}>
                    {s.pitch}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="h-1 rounded-full w-16" style={{ background: B.sand }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(filled / fields.length) * 100}%`, background: complete ? B.gold : B.copper }}
                      />
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: complete ? B.copper : B.muted }}>
                      {complete ? (
                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> On the record</span>
                      ) : (
                        `${filled} of ${fields.length} answered`
                      )}
                    </span>
                    <ArrowRight
                      className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1"
                      style={{ color: B.navy }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onBegin(SITTINGS.map((s) => s.id))}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: B.navy, color: '#fff' }}
      >
        Sit for both <ArrowRight className="w-4 h-4" />
      </button>
      <p className="text-[11px] text-center mt-2.5 mb-1" style={{ color: B.muted }}>
        Nothing publishes until you say so at the end.
      </p>
    </div>
  );
}