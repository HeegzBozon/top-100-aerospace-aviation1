import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Pencil, Users, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SEGMENT_FIELDS, describeRules, optionsFor } from './mailRoomConfig';
import SegmentInsights from './SegmentInsights';

const BLANK = { id: '', name: '', description: '', ghl_tag: '', rules: [] };

const inputClass =
  'w-full rounded-md px-2.5 py-1.5 text-xs outline-none placeholder:text-[#5f7387]';
const inputStyle = { background: 'rgba(6,12,20,0.55)', color: '#efe9dc', border: '1px solid rgba(201,168,124,0.22)' };

function RuleRow({ rule, onChange, onRemove, seasons = [] }) {
  const field = SEGMENT_FIELDS.find((entry) => entry.field === rule.field) || SEGMENT_FIELDS[0];
  const options = optionsFor(field, seasons);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={field.field}
        onChange={(event) => onChange({ field: event.target.value, value: '' })}
        className={`${inputClass} min-w-0 flex-1`}
        style={{ ...inputStyle, flexBasis: 140, maxWidth: 180 }}
      >
        {SEGMENT_FIELDS.map((entry) => (
          <option key={entry.field} value={entry.field} style={{ color: '#111' }}>
            {entry.label}
          </option>
        ))}
      </select>

      {field.free ? (
        <input
          value={rule.value}
          onChange={(event) => onChange({ ...rule, value: event.target.value })}
          placeholder={field.placeholder || ''}
          inputMode="numeric"
          className={`${inputClass} min-w-0 flex-1`}
          style={{ ...inputStyle, flexBasis: 80, maxWidth: 110 }}
        />
      ) : (
        <select
          value={String(rule.value || '')}
          onChange={(event) => onChange({ ...rule, value: event.target.value })}
          className={`${inputClass} min-w-0 flex-1`}
          style={{ ...inputStyle, flexBasis: 110 }}
        >
          <option value="" style={{ color: '#111' }}>Anyone</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} style={{ color: '#111' }}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      <button onClick={onRemove} className="desk-key desk-key-quiet flex-none" aria-label="Remove rule">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// THE SMART LISTS — a segment is a saved question, never a saved list of people. It holds
// rules; the people are resolved from the ledger every time the desk or a send asks, so a
// reader who leaves the list leaves every segment they were in.
export default function SegmentsPanel({ room }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const segments = room.data?.segments || [];
  const seasons = room.data?.seasons || [];
  const reachable = room.data?.summary?.mailable || 0;

  const save = async () => {
    const name = String(draft?.name || '').trim();
    if (!name) {
      toast({ title: 'A segment needs a name', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      name,
      description: String(draft.description || '').trim(),
      ghl_tag: String(draft.ghl_tag || '').trim(),
      rules: (draft.rules || []).filter((rule) => String(rule?.value ?? '').trim() !== ''),
      active: true,
    };
    try {
      if (draft.id) await base44.entities.AudienceSegment.update(draft.id, payload);
      else await base44.entities.AudienceSegment.create(payload);
      await room.reload();
      setDraft(null);
      toast({ title: draft.id ? 'Segment updated' : 'Segment saved' });
    } catch (error) {
      toast({ title: 'The segment could not be saved', description: error?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // The house's own six lists, laid down in one pass. Safe to run again: a segment that
  // already exists is left exactly as it is, so this never overwrites an edit.
  const seed = async () => {
    setSeeding(true);
    try {
      const res = await base44.functions.invoke('seedMailSegments', {});
      if (res?.data?.error) throw new Error(res.data.error);
      const created = res?.data?.created?.length || 0;
      const skipped = res?.data?.skipped?.length || 0;
      await room.reload();
      toast({
        title: created ? `${created} smart list${created === 1 ? '' : 's'} laid down` : 'The house set is already in place',
        description: skipped ? `${skipped} existing list${skipped === 1 ? '' : 's'} left untouched.` : undefined,
      });
    } catch (error) {
      toast({ title: 'The house set could not be laid down', description: error?.message, variant: 'destructive' });
    } finally {
      setSeeding(false);
    }
  };

  const remove = async (segment) => {
    if (!window.confirm(`Remove "${segment.name}"? The rules go with it.`)) return;
    try {
      await base44.entities.AudienceSegment.delete(segment.id);
      await room.reload();
      toast({ title: 'Segment removed' });
    } catch (error) {
      toast({ title: 'The segment could not be removed', description: error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
            Smart lists
          </p>
          <p className="mt-1 text-xs" style={{ color: '#a3b8c9' }}>
            {segments.length
              ? `${segments.length} segment${segments.length === 1 ? '' : 's'} · ${reachable.toLocaleString()} addresses reachable in total`
              : 'A segment is a saved question about the audience. Nothing is copied when it is saved.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={seed} disabled={seeding} className="desk-key">
            <Sparkles className="h-3.5 w-3.5" /> {seeding ? 'Laying down…' : "Seed the house's lists"}
          </button>
          <button onClick={() => setDraft({ ...BLANK, rules: [{ field: 'source', value: 'subscriber' }] })} className="desk-key desk-key-primary">
            <Plus className="h-3.5 w-3.5" /> New segment
          </button>
        </div>
      </div>

      {room.state !== 'error' && <SegmentInsights room={room} />}

      {draft && (
        <div className="desk-plate space-y-3 p-3.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <label className="block">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#7d94aa' }}>
                Name
              </span>
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="Readers who joined on a profile"
                className={`${inputClass} mt-1`}
                style={inputStyle}
              />
            </label>
            <label className="block">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#7d94aa' }}>
                CRM tag
              </span>
              <input
                value={draft.ghl_tag}
                onChange={(event) => setDraft({ ...draft, ghl_tag: event.target.value })}
                placeholder="SmartList: Profile readers"
                className={`${inputClass} mt-1`}
                style={inputStyle}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#7d94aa' }}>
              One line on who it is for
            </span>
            <input
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="People the house met at the foot of a public record."
              className={`${inputClass} mt-1`}
              style={inputStyle}
            />
          </label>

          <div className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#7d94aa' }}>
              Rules · every rule must match
            </p>
            {(draft.rules || []).map((rule, index) => (
              <RuleRow
                key={index}
                rule={rule}
                seasons={seasons}
                onChange={(next) =>
                  setDraft({
                    ...draft,
                    rules: draft.rules.map((existing, position) => (position === index ? next : existing)),
                  })
                }
                onRemove={() =>
                  setDraft({ ...draft, rules: draft.rules.filter((_, position) => position !== index) })
                }
              />
            ))}
            <button
              onClick={() => setDraft({ ...draft, rules: [...(draft.rules || []), { field: 'joined_within_days', value: '30' }] })}
              className="desk-key desk-key-quiet"
            >
              <Plus className="h-3 w-3" /> Add rule
            </button>
          </div>

          <p className="text-[10px]" style={{ color: '#7d94aa' }}>
            {describeRules(draft.rules, seasons)}
          </p>

          <div className="flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: 'rgba(250,248,245,0.08)' }}>
            <button onClick={save} disabled={saving} className="desk-key desk-key-primary">
              {saving ? 'Saving…' : draft.id ? 'Save segment' : 'Create segment'}
            </button>
            <button onClick={() => setDraft(null)} className="desk-key desk-key-quiet">
              Cancel
            </button>
          </div>
        </div>
      )}

      {room.state === 'error' ? (
        <div className="desk-plate px-3 py-6 text-center">
          <p className="text-xs" style={{ color: '#f2a1a1' }}>{room.error}</p>
          <button onClick={() => room.reload()} className="desk-key mt-3">Try again</button>
        </div>
      ) : segments.length === 0 ? (
        <div className="desk-plate px-4 py-10 text-center">
          <Users className="mx-auto h-5 w-5" style={{ color: '#c9a87c' }} />
          <p className="mt-3 text-sm font-semibold" style={{ color: '#f5efe4' }}>No segment yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed" style={{ color: '#7d94aa' }}>
            Start with the readers who joined in the last thirty days, or the members who have never opened a letter.
            A segment holds rules, so it stays true as the audience changes.
          </p>
          <button onClick={seed} disabled={seeding} className="desk-key desk-key-primary mt-3">
            <Sparkles className="h-3.5 w-3.5" /> {seeding ? 'Laying down…' : "Lay down the house's six lists"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {segments.map((segment) => (
            <div key={segment.id} className="desk-plate p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold" style={{ color: '#f5efe4' }}>{segment.name}</p>
                  <p className="mt-3 font-heading text-[26px] leading-none tabular-nums" style={{ color: '#c9a87c' }}>
                    {segment.count.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[10px]" style={{ color: '#7d94aa' }}>addresses reached today</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() =>
                      setDraft({
                        id: segment.id,
                        name: segment.name,
                        description: segment.description,
                        ghl_tag: segment.ghl_tag,
                        rules: segment.rules?.length ? segment.rules : [{ field: 'source', value: 'subscriber' }],
                      })
                    }
                    className="desk-key desk-key-quiet"
                    aria-label={`Edit ${segment.name}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => remove(segment)} className="desk-key desk-key-quiet" aria-label={`Remove ${segment.name}`}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <p className="mt-3 border-t pt-2 text-[11px] leading-relaxed" style={{ borderColor: 'rgba(250,248,245,0.08)', color: '#a3b8c9' }}>
                {describeRules(segment.rules, seasons)}
              </p>
              {segment.ghl_tag && (
                <p className="mt-2 inline-flex rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em]" style={{ background: 'rgba(201,168,124,0.14)', color: '#c9a87c' }}>
                  {segment.ghl_tag}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}