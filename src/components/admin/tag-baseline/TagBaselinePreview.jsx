import { X } from 'lucide-react';

// One profile's drafted words, as the desk reads them before anything is filed.
//
// Every pill says where it came from: a word the record states outright is marked in navy,
// one read off the record is marked in copper. The evidence sits under the pill, so a word
// can be checked against the record in the same breath. Pressing a pill drops it.
const FACET_LABEL = { field: 'Field', role: 'Role', impact: 'Impact', region: 'Region' };

export default function TagBaselinePreview({ proposal, onToggle, onDismiss }) {
  const filed = proposal.tags.filter((tag) => tag.keep !== false);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-body text-[13px] font-semibold text-[var(--text)]">{proposal.name}</p>
          <p className="mt-0.5 truncate font-body text-[10.5px] text-[var(--muted)]">
            {proposal.carried.length > 0
              ? `Already carries ${proposal.carried.join(' · ')}`
              : 'Carries no words yet'}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss ${proposal.name}`}
          className="shrink-0 rounded p-1 text-[var(--muted)] transition-colors hover:bg-[var(--border)]/50 hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {proposal.tags.length === 0 ? (
        <p className="mt-2 font-body text-[11px] italic text-[var(--muted)]">
          The record does not support a word in any facet. Left as it stands.
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {proposal.tags.map((tag, index) => {
            const dropped = tag.keep === false;
            const inferred = tag.basis === 'inferred';
            return (
              <li key={`${tag.label}-${index}`}>
                <button
                  type="button"
                  onClick={() => onToggle(index)}
                  aria-pressed={!dropped}
                  title={`${FACET_LABEL[tag.facet || ''] || tag.category} · ${inferred ? 'read off the record' : 'stated by the record'} — ${tag.evidence}`}
                  className={`flex flex-col items-start gap-0.5 rounded border px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
                    dropped
                      ? 'border-dashed border-[var(--border)] text-[var(--muted)] opacity-60'
                      : inferred
                        ? 'border-editorial-copper/60 bg-editorial-copper/10 text-[var(--text)]'
                        : 'border-editorial-navy/35 bg-editorial-navy/5 text-[var(--text)]'
                  }`}
                >
                  <span className="font-body text-[10.5px] font-semibold leading-none">
                    {tag.label}
                    <span className="ml-1.5 font-body text-[7.5px] font-bold uppercase tracking-[0.1em] opacity-60">
                      {FACET_LABEL[tag.facet || ''] || tag.category}
                    </span>
                  </span>
                  <span className="max-w-[190px] truncate font-body text-[8.5px] leading-none opacity-60">
                    {tag.evidence}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-2 font-body text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">
        {filed.length === 0 ? 'Nothing will be filed' : `${filed.length} to file`}
        {proposal.read_failed ? ' · the reading could not be taken, record fields only' : ''}
      </p>
    </div>
  );
}