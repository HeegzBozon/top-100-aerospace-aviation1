import { useMemo } from 'react';
import IssueRow from './IssueRow';

// The calendar itself, read as month bands: the way a year of issues is actually kept.
// Each band is a month, each line an issue, and the month's count is printed once.
export default function IssueTimeline({ issues, selectedId, onSelect }) {
  const bands = useMemo(() => {
    const byMonth = new Map();
    issues.forEach((issue) => {
      const key = issue.issue_date ? issue.issue_date.slice(0, 7) : 'undated';
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key).push(issue);
    });
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, rows]) => ({
        key,
        label:
          key === 'undated'
            ? 'Undated'
            : new Date(`${key}-01T12:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        rows: rows.sort((a, b) => (a.issue_date || '').localeCompare(b.issue_date || '')),
      }));
  }, [issues]);

  if (!issues.length) {
    return (
      <div className="rounded-md p-10 text-center" style={{ border: '1px dashed rgba(201,168,124,0.32)' }}>
        <p className="font-heading text-lg" style={{ color: '#f5efe4' }}>
          No issues on the calendar yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5" style={{ color: '#7d94aa' }}>
          The playbook grid runs from No. 42 to No. 71. File it once and every issue lands here with its date,
          type and length.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {bands.map((band) => (
        <section key={band.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2 px-2.5">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: '#c9a87c' }}>
              {band.label}
            </h3>
            <span className="text-[9px] tracking-[0.16em]" style={{ color: '#5f7488' }}>
              {band.rows.length} {band.rows.length === 1 ? 'issue' : 'issues'}
            </span>
          </div>
          <div className="space-y-0.5">
            {band.rows.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                selected={selectedId === issue.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}