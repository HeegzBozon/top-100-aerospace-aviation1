import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import IntentModeCard from './IntentModeCard';
import IntentSegmented from './IntentSegmented';
import { MODES, MODE_ORDER, INQUIRY_ROUTE_OPTIONS, enabledModes } from './intentConfig';

const FIELDS = [
  'intent_hire_enabled',
  'intent_commercial_enabled',
  'hire_pitch',
  'hire_capabilities',
  'hire_availability',
  'hire_work_preference',
  'hire_regions',
  'commercial_pitch',
  'commercial_offerings',
  'commercial_engagements',
  'commercial_sectors',
  'inquiry_route',
  'dossier_enabled',
];

const pick = (settings) => {
  const draft = {};
  for (const field of FIELDS) {
    const value = settings?.[field];
    draft[field] =
      field === 'intent_hire_enabled' || field === 'intent_commercial_enabled' || field === 'dossier_enabled'
        ? value === true
        : Array.isArray(value)
          ? [...value]
          : value ?? '';
  }
  return draft;
};

// The two doors, held independently. A Fellow opens either, both, or neither; each
// carries its own curated fields. Nothing here is published until the change is
// written, and nothing written here is ever read by discovery, measurement or scoring.
// `part` renders one half of the panel: the offer itself ("pitch") or how people
// reach the Fellow ("availability"). Both edit the same record.
export default function IntentStudioPanel({ settings, accent, onSave, saving, error, part = 'all' }) {
  const showPitch = part !== 'availability';
  const showReach = part !== 'pitch';
  const [draft, setDraft] = useState(() => pick(settings));

  // A settings record that arrives after first paint (or is replaced by the server
  // after a save) re-seeds the draft, so the panel always edits the live record.
  useEffect(() => {
    setDraft(pick(settings));
  }, [settings?.id]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(pick(settings)),
    [draft, settings]
  );

  const setField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
  const open = enabledModes(draft);

  return (
    <section className="px-3 pb-4 pt-3">
      <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
        {showReach ? 'Availability' : 'Cover story'}
      </p>
      <h2 className="mt-1.5 font-heading text-[19px] font-semibold leading-tight" style={{ color: B.navy }}>
        {showReach ? 'Availability' : 'Cover story'}
      </h2>
      <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
        {showReach
          ? 'What you are open to right now — a career conversation, a commercial engagement, or both. Visitors write privately; your address is never shown.'
          : 'The two lines that introduce you: what you want next, and what you can be engaged to do. Both are optional and independent of each other.'}
      </p>

      <div className="mt-3 space-y-2.5">
        {showPitch && MODE_ORDER.map((mode) => (
          <IntentModeCard
            key={mode}
            mode={mode}
            enabled={draft[MODES[mode].flag] === true}
            draft={draft}
            setField={setField}
            accent={accent}
          />
        ))}

        {showReach && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.86)', border: `1px solid ${B.border}` }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
            How people reach you
          </p>
          <div className="mt-2">
            <IntentSegmented
              options={INQUIRY_ROUTE_OPTIONS}
              value={draft.inquiry_route || 'form'}
              onChange={(key) => setField('inquiry_route', key)}
            />
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
            {INQUIRY_ROUTE_OPTIONS.find((option) => option.key === (draft.inquiry_route || 'form'))?.note}
          </p>

          <div className="mt-3 flex items-start justify-between gap-3 border-t pt-3" style={{ borderColor: B.border }}>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold" style={{ color: B.navy }}>Release the one-page dossier</p>
              <p className="mt-0.5 text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
                Composed from your published record. It carries no address.
              </p>
            </div>
            <Switch
              checked={draft.dossier_enabled !== false}
              onCheckedChange={(next) => setField('dossier_enabled', next)}
              aria-label="Release the dossier"
            />
          </div>
        </div>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg px-3 py-2 text-[11.5px]" style={{ background: 'rgba(184,115,51,0.12)', color: B.copper }}>
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => onSave(draft)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[12px] font-bold uppercase tracking-[0.16em] transition-opacity disabled:opacity-40"
          style={{ background: B.navy, color: '#fff' }}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Saving' : dirty ? 'Save' : 'Saved'}
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] leading-relaxed" style={{ color: B.muted }}>
        {open.length
          ? `Open now: ${open.map((mode) => MODES[mode].label).join(' and ')}.`
          : 'Nothing open right now. No offer and no inquiry form appear on your profile.'}
      </p>
    </section>
  );
}