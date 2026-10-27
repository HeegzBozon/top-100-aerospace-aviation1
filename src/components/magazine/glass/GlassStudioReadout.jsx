import { MAGAZINE_PALETTE as P, ARTICLE_STATUSES, articleStatusLabel, statusLabel, ISSUE_STATUSES } from '@/components/magazine/magazineConfig';

// The readouts printed above the keys on the glass: what the surface is holding, what
// still wants attention, and — before anything is published — the readiness of the
// issue. They are read at a glance rather than walked, so they sit above the list the
// ring is standing on.

function Line({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: tone || 'rgba(30,58,90,0.42)' }}>
        {label}
      </span>
      <span className="text-right text-[10px]" style={{ color: P.navy }}>{value}</span>
    </div>
  );
}

function Advice({ children, tone }) {
  return (
    <p className="text-[10px] leading-relaxed" style={{ color: tone || 'rgba(30,58,90,0.6)' }}>
      {children}
    </p>
  );
}

export function InventoryReadout({ issues, error, alchemizing }) {
  return (
    <div className="space-y-1.5">
      {error
        ? <Advice tone={P.copper}>{error} Use the first key to try the archive again.</Advice>
        : <Line label="Editions in the archive" value={issues.length} />}
      {alchemizing ? (
        <Advice tone={P.copper}>
          Binding the 2025 edition: nine sections, its editorial copy, and the hundred honorees it resolves.
        </Advice>
      ) : (
        <Advice>
          {issues.length
            ? 'Open an issue to work it, or bind a new one from the published 2025 edition.'
            : 'No issues yet. The 2025 edition is waiting to be bound, or start from a blank blueprint.'}
        </Advice>
      )}
    </div>
  );
}

export function IssueReadout({ issue, loadingDetail }) {
  if (loadingDetail) return <Advice>Reading the issue…</Advice>;
  return <Line label="Status" value={statusLabel(ISSUE_STATUSES, issue?.status)} />;
}

export function BlueprintReadout({ issue, sectionCount }) {
  return (
    <div className="space-y-1.5">
      <Line label="Issue" value={issue?.title || ''} />
      <Line label="Cover line" value={issue?.cover_kicker || '—'} />
      <Line label="Sections" value={sectionCount} />
      <Advice>
        Open a section to rename it, move it between the parts of the book, or take it out. The masthead fields hold
        the issue's own copy.
      </Advice>
    </div>
  );
}

export function ArticlesReadout({ articles }) {
  const counts = {};
  articles.forEach((article) => {
    counts[article.status] = (counts[article.status] || 0) + 1;
  });
  const spread = ARTICLE_STATUSES.filter((status) => counts[status.key])
    .map((status) => `${counts[status.key]} ${status.label.toLowerCase()}`)
    .join(' · ');

  return (
    <div className="space-y-1.5">
      <Line label="Articles" value={articles.length} />
      {spread ? <Advice>{spread}</Advice> : null}
      <Advice>
        Open an article to write its headline, standfirst, byline and copy, or to move it along in its status.
      </Advice>
    </div>
  );
}

export function PagesReadout({ pages }) {
  return (
    <div className="space-y-1.5">
      <Line label="Pages" value={pages.length} />
      <Advice>Open a page to read it whole, as a reader will. Back and forward turn the pages.</Advice>
    </div>
  );
}

export function PublishReadout({ issue, articles, pages }) {
  const published = issue?.status === 'published';
  const unresolved = articles.filter((article) => !['ready', 'laid_out', 'published'].includes(article.status)).length;
  const checks = [
    { label: 'Articles drafted or laid out', ok: unresolved === 0, detail: unresolved ? `${unresolved} still open` : 'All in' },
    { label: 'Pages composed', ok: pages.length > 0, detail: pages.length ? `${pages.length} pages` : 'None yet' },
    { label: 'Cover set', ok: Boolean(issue?.cover_image_url), detail: issue?.cover_image_url ? 'Set' : 'No cover image' },
  ];

  return (
    <div className="space-y-1.5">
      <Line
        label="Status"
        value={published
          ? `Live${issue?.published_date ? ` · ${new Date(issue.published_date).toLocaleDateString()}` : ''}`
          : 'Draft'}
      />
      {checks.map((check) => (
        <Line
          key={check.label}
          label={`${check.ok ? '·' : '!'} ${check.label}`}
          value={check.detail}
          tone={check.ok ? undefined : P.copper}
        />
      ))}
    </div>
  );
}