import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import DeskHandoff from './DeskHandoff';
import CampaignSheet from './CampaignSheet';
import { DESKS, ISSUE_TYPES, STAGES, formatOf, stageMeta, typeMeta } from './calendarConfig';

const FIELD = 'w-full rounded px-2.5 py-1.5 text-[11.5px] outline-none focus:border-editorial-gold/60';
const FIELD_STYLE = { background: 'rgba(6,12,20,0.55)', border: '1px solid rgba(201,168,124,0.22)', color: '#f5efe4' };
const LABEL = 'text-[8px] font-bold uppercase tracking-[0.18em]';

const toForm = (issue) => ({
  issue_name: issue.issue_name || '',
  issue_date: issue.issue_date || '',
  issue_type: issue.issue_type || 'Standard',
  stage: issue.stage || 'planned',
  owner_name: issue.owner_name || '',
  next_action: issue.next_action || '',
  next_action_due: issue.next_action_due || '',
  lead_story: issue.lead_story || '',
  why_now: issue.why_now || '',
  blockers: (issue.blockers || []).join('\n'),
  notes: issue.notes || '',
});

// THE ISSUE — the plan and the three handoffs, side by side.
//
// The left column is what the calendar owns: the date, the type, who owns the next step and
// what is blocking it. The right column is the seam: each desk, what it says its own state
// is, and the one key that stages it. Nothing on this page writes into a desk's work.
export default function IssueWorkspace({ issue, campaign, busy, onSave, onStage, onDraft, onSaveCampaign, children }) {
  const [form, setForm] = useState(() => toForm(issue));

  useEffect(() => {
    setForm(toForm(issue));
  }, [issue.id, issue.updated_date]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const type = typeMeta(form.issue_type);
  const stage = stageMeta(issue.readiness || issue.stage);

  const submit = () =>
    onSave(issue.id, {
      ...form,
      blockers: form.blockers.split('\n').map((line) => line.trim()).filter(Boolean),
    });

  return (
    <div className="space-y-3">
      <div className="desk-plate p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
              No. {issue.issue_no} · {type.key} · {formatOf(issue.issue_type) === 'magazine' ? 'magazine' : 'quick'}
            </p>
            <h3 className="mt-1.5 font-heading text-xl leading-tight" style={{ color: '#f5efe4' }}>
              {issue.issue_name}
            </h3>
            <p className="mt-1 text-[9.5px]" style={{ color: '#7d94aa' }}>
              Target {type.words} words · {type.note}
              {issue.style_version ? ` · drafted to guide v${issue.style_version}` : ''}
            </p>
          </div>
          <span
            className="flex-none rounded px-2 py-1 text-[8px] font-bold uppercase tracking-[0.16em]"
            style={{ background: `${stage.tone}1f`, color: stage.tone }}
          >
            {stage.label}
          </span>
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              Issue name
            </span>
            <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.issue_name} onChange={set('issue_name')} />
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              Lands on
            </span>
            <input type="date" className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.issue_date} onChange={set('issue_date')} />
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              Type
            </span>
            <select className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.issue_type} onChange={set('issue_type')}>
              {ISSUE_TYPES.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.key} · {option.words}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              The house's stage
            </span>
            <select className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.stage} onChange={set('stage')}>
              {STAGES.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              The lead story
            </span>
            <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.lead_story} onChange={set('lead_story')} placeholder="One story the Briefing carries" />
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              Why now
            </span>
            <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.why_now} onChange={set('why_now')} placeholder="Feeds the Editor's Note" />
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              Owner of the next step
            </span>
            <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.owner_name} onChange={set('owner_name')} />
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              Next step due
            </span>
            <input type="date" className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.next_action_due} onChange={set('next_action_due')} />
          </label>
          <label className="sm:col-span-2">
            <span className={LABEL} style={{ color: '#5f7488' }}>
              The one next thing
            </span>
            <input className={`mt-1 ${FIELD}`} style={FIELD_STYLE} value={form.next_action} onChange={set('next_action')} placeholder="Clear the Sponsor credit with Katja" />
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              Blockers, one a line
            </span>
            <textarea className={`mt-1 ${FIELD}`} style={FIELD_STYLE} rows={2} value={form.blockers} onChange={set('blockers')} />
          </label>
          <label>
            <span className={LABEL} style={{ color: '#5f7488' }}>
              Desk note
            </span>
            <textarea className={`mt-1 ${FIELD}`} style={FIELD_STYLE} rows={2} value={form.notes} onChange={set('notes')} />
          </label>
        </div>

        <div className="mt-3 flex justify-end">
          <button type="button" onClick={submit} disabled={busy} className="desk-key desk-key-primary disabled:opacity-50">
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save the plan
          </button>
        </div>
      </div>

      <div className="desk-plate p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
          The three desks
        </p>
        <div className="mt-2.5 space-y-2">
          {DESKS.map((desk) => (
            <DeskHandoff
              key={desk.key}
              issue={issue}
              desk={desk}
              state={(issue.desks || []).find((d) => d.key === desk.key)}
              busy={busy}
              onStage={(key) => onStage(issue.id, key)}
              onDraft={() => onDraft(issue.id)}
            />
          ))}
        </div>
        {(issue.blockers || []).length ? (
          <div className="mt-3 rounded px-2.5 py-2" style={{ background: 'rgba(224,138,138,0.10)' }}>
            <p className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: '#e08a8a' }}>
              Held by
            </p>
            {issue.blockers.map((blocker) => (
              <p key={blocker} className="mt-0.5 text-[10px]" style={{ color: '#f0c9c9' }}>
                {blocker}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {issue.campaign_id ? (
        <CampaignSheet campaign={campaign} issue={issue} busy={busy} onSave={onSaveCampaign} />
      ) : null}

      {children}

      {(issue.timeline || []).length ? (
        <div className="desk-plate p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
            What has been done
          </p>
          <div className="mt-2 space-y-1">
            {[...issue.timeline]
              .reverse()
              .slice(0, 8)
              .map((entry, index) => (
                <div key={`${entry.at}-${index}`} className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-[10px]" style={{ color: '#dbe6ef' }}>
                    {entry.detail}
                  </p>
                  <p className="flex-none text-[9px]" style={{ color: '#5f7488' }}>
                    {new Date(entry.at).toLocaleDateString()} · {entry.by}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}