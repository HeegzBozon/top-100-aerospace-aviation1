import { ArrowUpRight, Loader2, Plus } from 'lucide-react';
import { deskStatusLabel } from './calendarConfig';

// One desk's handoff. The card states what the desk owns, what that desk currently says
// its own state is, and the one key that stages it. Nothing here edits a desk's work:
// this is the seam, and it says so.
export default function DeskHandoff({ issue, desk, state, busy, onStage, onDraft }) {
  const linked = state?.linked;
  const status = deskStatusLabel(desk.key, state?.status);
  const complete = Boolean(state?.complete);
  const halted = Boolean(state?.halted);

  const tone = halted ? '#e08a8a' : complete ? '#7ec89a' : linked ? '#c9a87c' : '#5f7488';

  return (
    <div
      className="rounded-md px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,0.035)', boxShadow: 'inset 0 0 0 1px rgba(201,168,124,0.14)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold" style={{ color: '#f5efe4' }}>
            {desk.label}
          </p>
          <p className="mt-0.5 text-[9.5px] leading-4" style={{ color: '#7d94aa' }}>
            {desk.owns}
          </p>
        </div>
        <span
          className="flex-none rounded px-1.5 py-[1px] text-[7.5px] font-bold uppercase tracking-[0.16em]"
          style={{ background: `${tone}1f`, color: tone }}
        >
          {status}
        </span>
      </div>

      {desk.key === 'mail' && linked && state?.status === 'sent' ? (
        <p className="mt-2 text-[9.5px]" style={{ color: '#7d94aa' }}>
          {issue.mail_sent_count || 0} accepted · {issue.mail_failed_count || 0} refused
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {!linked && (
          <button type="button" onClick={() => onStage(desk.key)} disabled={busy} className="desk-key disabled:opacity-50">
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Open in {desk.label}
          </button>
        )}

        {linked && desk.key === 'mail' && state?.status !== 'sent' && state?.status !== 'sending' && (
          <button type="button" onClick={() => onDraft(desk.key)} disabled={busy} className="desk-key disabled:opacity-50">
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Draft to the standard
          </button>
        )}

        {linked && (
          <a href={desk.where} className="desk-key desk-key-quiet">
            Open
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}