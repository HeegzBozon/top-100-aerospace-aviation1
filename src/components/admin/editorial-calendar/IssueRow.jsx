import { deskStatusLabel, formatOf, stageMeta, typeMeta } from './calendarConfig';

// One issue on the grid. The date is printed as a plate, the number and name carry the row,
// and the right-hand rail reports the three desks the issue is handed to. The calendar's
// whole job is to say where an issue has got to, not what is inside it.
export default function IssueRow({ issue, selected, onSelect }) {
  const stage = stageMeta(issue.readiness || issue.stage);
  const type = typeMeta(issue.issue_type);
  const date = issue.issue_date ? new Date(`${issue.issue_date}T12:00:00`) : null;
  const day = date ? date.toLocaleDateString(undefined, { day: '2-digit' }) : '—';
  const month = date ? date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase() : '';

  const desks = issue.desks || [
    { key: 'magazine', linked: Boolean(issue.magazine_issue_id) },
    { key: 'mail', linked: Boolean(issue.mail_issue_id) },
    { key: 'campaign', linked: Boolean(issue.campaign_id) },
  ];

  return (
    <button
      type="button"
      onClick={() => onSelect(issue)}
      aria-current={selected ? 'true' : undefined}
      className="flex w-full items-stretch gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors"
      style={
        selected
          ? { background: 'rgba(201,168,124,0.12)', boxShadow: 'inset 0 0 0 1px rgba(201,168,124,0.55)' }
          : { background: 'transparent' }
      }
    >
      <span
        className="flex w-11 flex-none flex-col items-center justify-center rounded border py-1"
        style={{ borderColor: 'rgba(201,168,124,0.28)', background: 'rgba(6,12,20,0.5)' }}
      >
        <span className="font-heading text-[15px] leading-none" style={{ color: '#f5efe4' }}>
          {day}
        </span>
        <span className="mt-0.5 text-[7.5px] font-bold tracking-[0.16em]" style={{ color: '#7d94aa' }}>
          {month}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="text-[9px] font-bold tracking-[0.18em]" style={{ color: '#c9a87c' }}>
            No. {issue.issue_no}
          </span>
          <span
            className="rounded px-1.5 py-[1px] text-[7.5px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8fa6ba' }}
          >
            {type.key} · {formatOf(issue.issue_type)}
          </span>
        </span>
        <span className="mt-1 block truncate font-heading text-[15px] leading-tight" style={{ color: '#f5efe4' }}>
          {issue.issue_name || 'Untitled issue'}
        </span>
        <span className="mt-1 block truncate text-[10.5px] leading-4" style={{ color: '#7d94aa' }}>
          {issue.next_action || `Target ${type.words} words`}
        </span>
      </span>

      <span className="flex flex-none flex-col items-end justify-between gap-1.5">
        <span
          className="rounded px-1.5 py-[1px] text-[7.5px] font-bold uppercase tracking-[0.16em]"
          style={{ background: `${stage.tone}1f`, color: stage.tone }}
        >
          {stage.label}
        </span>
        <span className="flex items-center gap-1">
          {desks.map((desk) => (
            <span
              key={desk.key}
              title={`${desk.key}: ${deskStatusLabel(desk.key, desk.status)}`}
              className="h-1 w-3.5 rounded-full"
              style={{
                background: desk.complete ? '#7ec89a' : desk.linked ? '#b87333' : 'rgba(255,255,255,0.10)',
              }}
            />
          ))}
        </span>
      </span>
    </button>
  );
}