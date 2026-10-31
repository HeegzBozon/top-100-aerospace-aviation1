import { Switch } from '@/components/ui/switch';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import IntentChips from './IntentChips';
import IntentSegmented from './IntentSegmented';
import {
  MODES,
  CAPABILITY_LABELS,
  OFFERING_LABELS,
  REGION_LABELS,
  DISCIPLINE_LABELS,
  AVAILABILITY_OPTIONS,
  ENGAGEMENT_OPTIONS,
  WORK_PREFERENCES,
} from './intentConfig';

// One door, and the curated fields behind it. The switch is the Fellow's alone and
// independent of the other door: either can stand open without the other. Nothing
// written here reaches discovery ordering, measurement, or scoring.
export default function IntentModeCard({ mode, enabled, draft, setField, accent }) {
  const spec = MODES[mode];
  const pitchField = spec.pitchField;
  const pitch = draft[pitchField] || '';

  const toggleIn = (field) => (key) =>
    setField(
      field,
      (draft[field] || []).includes(key)
        ? (draft[field] || []).filter((entry) => entry !== key)
        : [...(draft[field] || []), key]
    );

  return (
    <div
      className="rounded-2xl p-4 transition-colors"
      style={{
        background: enabled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.55)',
        border: `1px solid ${enabled ? `${accent}66` : B.border}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: enabled ? B.copper : B.muted }}>
            {spec.kicker}
          </p>
          <h3 className="mt-1 font-heading text-[17px] font-semibold leading-tight" style={{ color: B.navy }}>
            {spec.label}
          </h3>
        </div>
        <Switch
          checked={!!enabled}
          onCheckedChange={(next) => setField(spec.flag, next)}
          aria-label={`${spec.label} ${enabled ? 'on' : 'off'}`}
        />
      </div>

      {enabled ? (
        <div className="mt-3 space-y-3">
          <div>
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>
              What you want next
            </p>
            <textarea
              rows={2}
              maxLength={280}
              value={pitch}
              onChange={(event) => setField(pitchField, event.target.value)}
              placeholder={
                mode === 'hire'
                  ? 'The role or program you want to be running next, in two lines.'
                  : 'What you can be engaged to do, in two lines.'
              }
              className="w-full resize-none rounded-lg px-3 py-2 text-[12.5px] leading-relaxed outline-none"
              style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
            />
            <p className="mt-0.5 text-right text-[10px]" style={{ color: B.muted }}>{pitch.length} / 280</p>
          </div>

          <IntentSegmented
            label={mode === 'hire' ? 'Availability' : 'Engagements'}
            options={mode === 'hire' ? AVAILABILITY_OPTIONS : ENGAGEMENT_OPTIONS}
            value={draft[spec.availabilityField] || (mode === 'hire' ? 'open_selective' : 'open_selective')}
            onChange={(key) => setField(spec.availabilityField, key)}
          />

          {mode === 'hire' && (
            <IntentSegmented
              label="Where"
              options={WORK_PREFERENCES}
              value={draft.hire_work_preference || 'flexible'}
              onChange={(key) => setField('hire_work_preference', key)}
            />
          )}

          <IntentChips
            label={spec.optionsLabel}
            map={mode === 'hire' ? CAPABILITY_LABELS : OFFERING_LABELS}
            values={draft[spec.optionsField] || []}
            onToggle={toggleIn(spec.optionsField)}
            accent={accent}
          />

          {mode === 'hire' ? (
            <IntentChips
              label="Regions"
              map={REGION_LABELS}
              values={draft.hire_regions || []}
              onToggle={toggleIn('hire_regions')}
              accent={accent}
            />
          ) : (
            <IntentChips
              label="Sectors you'll take work in"
              map={DISCIPLINE_LABELS}
              values={draft.commercial_sectors || []}
              onToggle={toggleIn('commercial_sectors')}
              accent={accent}
            />
          )}
        </div>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: B.muted }}>
          Closed. Your public profile carries no offer, no inquiry form and no desk listing.
        </p>
      )}
    </div>
  );
}