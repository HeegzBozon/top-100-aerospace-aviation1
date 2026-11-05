import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { CHANNELS } from './calendarConfig';

const FIELD =
  'w-full rounded px-2.5 py-1.5 text-[11.5px] outline-none focus:border-editorial-gold/60';
const FIELD_STYLE = {
  background: 'rgba(6,12,20,0.55)',
  border: '1px solid rgba(201,168,124,0.22)',
  color: '#f5efe4',
};

const LABEL = 'text-[8px] font-bold uppercase tracking-[0.18em]';

const EMPTY = {
  audience: '',
  reader_action: '',
  action_url: '',
  channels: [],
  measure: '',
  measure_event: '',
  status: 'planned',
  owner_name: '',
  evidence: '',
  evidence_source: '',
};

// The Funnel Desk's plan for carrying one issue: who it is for, what is asked of them,
// where it is carried, and what the house will count. The desk owns this page; the
// calendar only reads the status off it.
export default function CampaignSheet({ campaign, issue, busy, onSave }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm({ ...EMPTY, ...(campaign || {}) });
  }, [campaign?.id]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const toggleChannel = (channel) =>
    setForm((prev) => ({
      ...prev,
      channels: prev.channels?.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...(prev.channels || []), channel],
    }));

  return (
    <div className="desk-plate p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
        Funnel Desk · the campaign plan
      </p>
      <p className="mt-1 text-[9.5px] leading-4" style={{ color: '#7d94aa' }}>
        Carrying No. {issue.issue_no}. Named before the issue goes out, so the number afterwards has something to
        be read against.
      </p>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className={LABEL} style={{ color: '#5f7488' }}>
            Who it is for
          </span>
          <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.audience} onChange={set('audience')} placeholder="Fellows who have not claimed their record" />
        </label>

        <label>
          <span className={LABEL} style={{ color: '#5f7488' }}>
            The reader's one action
          </span>
          <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.reader_action} onChange={set('reader_action')} placeholder="Claim a record" />
        </label>

        <label>
          <span className={LABEL} style={{ color: '#5f7488' }}>
            Where that action is taken
          </span>
          <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.action_url} onChange={set('action_url')} placeholder="/profiles/:id" />
        </label>

        <div className="sm:col-span-2">
          <span className={LABEL} style={{ color: '#5f7488' }}>
            Carried on
          </span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {CHANNELS.map((channel) => {
              const on = (form.channels || []).includes(channel);
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className="rounded px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    background: on ? 'rgba(184,115,51,0.35)' : 'rgba(255,255,255,0.04)',
                    color: on ? '#fdf8f0' : '#8fa6ba',
                    boxShadow: 'inset 0 0 0 1px rgba(201,168,124,0.22)',
                  }}
                >
                  {channel}
                </button>
              );
            })}
          </div>
        </div>

        <label>
          <span className={LABEL} style={{ color: '#5f7488' }}>
            What the house will count
          </span>
          <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.measure} onChange={set('measure')} placeholder="Record claims from the issue link" />
        </label>

        <label>
          <span className={LABEL} style={{ color: '#5f7488' }}>
            The event it reads
          </span>
          <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.measure_event} onChange={set('measure_event')} placeholder="profile_claim_submitted" />
        </label>

        <label>
          <span className={LABEL} style={{ color: '#5f7488' }}>
            Status
          </span>
          <select className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.status} onChange={set('status')}>
            {['planned', 'drafting', 'scheduled', 'live', 'reported', 'closed'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={LABEL} style={{ color: '#5f7488' }}>
            Owned by
          </span>
          <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.owner_name} onChange={set('owner_name')} />
        </label>

        <label className="sm:col-span-2">
          <span className={LABEL} style={{ color: '#5f7488' }}>
            What the house can show afterwards
          </span>
          <textarea className={`mt-1 ${FIELD}`} style={FIELD_STYLE} rows={2} value={form.evidence} onChange={set('evidence')} placeholder="Quoted from the source it was read from. Left empty when there is nothing to quote." />
        </label>

        <label className="sm:col-span-2">
          <span className={LABEL} style={{ color: '#5f7488' }}>
            Where that was read
          </span>
          <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.evidence_source} onChange={set('evidence_source')} placeholder="Analytics · nominations, last 30 days" />
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() => onSave({ campaign_id: campaign?.id, issue_id: issue.id, patch: form })}
          className="desk-key desk-key-primary disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save the campaign
        </button>
      </div>
    </div>
  );
}