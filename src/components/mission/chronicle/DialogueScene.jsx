import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { GUIDE } from './missionConfig';

// One scene. The guide speaks a line at a time and the Fellow answers by continuing —
// the pacing is theirs. A scene ends in one of three ways: a name, a choice from a
// curated set, or simply having been read. Nothing is timed, nothing advances alone.
export default function DialogueScene({ mission, onFinish, onChoose, saving }) {
  const lines = mission.lines || [];
  const [step, setStep] = useState(1);
  const [value, setValue] = useState('');
  const atEnd = step >= lines.length;
  const ready = !mission.field || value.trim().length > 0;

  return (
    <div className="mt-2 overflow-hidden rounded-xl" style={{ background: B.navy }}>
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{ borderColor: 'rgba(250,248,245,0.14)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: B.gold }} />
        <span className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
          {GUIDE.name} · {GUIDE.role}
        </span>
      </div>

      <div className="space-y-3 px-4 py-4 md:px-5">
        {lines.slice(0, step).map((line, i) => (
          <p
            key={i}
            className="text-[13px] leading-relaxed"
            style={{ color: i === step - 1 ? B.cream : 'rgba(250,248,245,0.52)' }}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="border-t px-4 py-3 md:px-5" style={{ borderColor: 'rgba(250,248,245,0.14)' }}>
        {!atEnd ? (
          <button
            type="button"
            onClick={() => setStep((n) => n + 1)}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em]"
            style={{ background: B.gold, color: B.navy }}
          >
            Continue <ArrowRight className="h-3 w-3" />
          </button>
        ) : mission.choices ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {mission.choices.map((choice) => (
              <button
                key={choice.key}
                type="button"
                disabled={saving}
                onClick={() => onChoose(mission, choice)}
                className="rounded-lg px-3 py-2.5 text-left transition-colors disabled:opacity-50"
                style={{ background: 'rgba(250,248,245,0.08)', border: '1px solid rgba(250,248,245,0.18)' }}
              >
                <span className="block font-heading text-[13px]" style={{ color: B.cream }}>
                  {choice.label}
                </span>
                {choice.note ? (
                  <span className="mt-0.5 block text-[10px] leading-snug" style={{ color: 'rgba(250,248,245,0.6)' }}>
                    {choice.note}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {mission.field ? (
              <label className="flex-1">
                <span className="sr-only">{mission.field.label}</span>
                <input
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder={mission.field.placeholder}
                  maxLength={mission.field.maxLength}
                  className="w-full rounded-full px-4 py-2 text-[13px] outline-none"
                  style={{ background: 'rgba(250,248,245,0.1)', color: B.cream, border: '1px solid rgba(250,248,245,0.22)' }}
                />
              </label>
            ) : null}
            <button
              type="button"
              disabled={!ready || saving}
              onClick={() => onFinish(mission, mission.field ? { [mission.field.key]: value.trim() } : undefined)}
              className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em] disabled:opacity-50"
              style={{ background: B.gold, color: B.navy }}
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {mission.field ? 'Begin' : 'Close the scene'}
            </button>
          </div>
        )}

        {mission.aside ? (
          <Link
            to={mission.aside.to}
            className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em]"
            style={{ color: B.gold }}
          >
            {mission.aside.label} <ArrowRight className="h-3 w-3" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}