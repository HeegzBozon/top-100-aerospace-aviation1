import { useState } from 'react';
import CredentialBadge from '@/components/my-top100/credentials/CredentialBadge';
import CredentialPass from '@/components/my-top100/credentials/CredentialPass';
import CredentialCard from '@/components/my-top100/credentials/CredentialCard';

// ── Three flavours of one record ──
//
// The credentials a Fellow is handed are one record printed three ways: the badge worn in a
// room, the pass carried to a desk, the card kept after they leave. So they are one deck,
// turned between — never three screens to hunt through.
export const CREDENTIAL_FLAVORS = [
  {
    key: 'badge',
    label: 'Badge',
    note: 'Worn in a room. The code hands your card over without a tap.',
  },
  {
    key: 'pass',
    label: 'Boarding pass',
    note: 'Carried to the desk. Who you are, read back from the record we hold.',
  },
  {
    key: 'card',
    label: 'Business card',
    note: 'Kept after you leave. The lines you chose to print, on cream stock.',
  },
];

export default function CredentialsDeck({ person, template, code, rows, hasExisting, year }) {
  const [flavor, setFlavor] = useState('badge');
  const active = CREDENTIAL_FLAVORS.find((entry) => entry.key === flavor) || CREDENTIAL_FLAVORS[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Your credentials"
        className="flex items-stretch gap-1 rounded-[9px] border border-editorial-copper/30 bg-editorial-cream p-1"
      >
        {CREDENTIAL_FLAVORS.map((entry) => {
          const on = entry.key === active.key;
          return (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setFlavor(entry.key)}
              className={`min-h-9 flex-1 rounded-[7px] px-1 font-body text-[9px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper ${
                on
                  ? 'bg-editorial-navy text-editorial-cream'
                  : 'text-editorial-navy/60 hover:bg-editorial-sand/70 hover:text-editorial-navy'
              }`}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 font-body text-[10.5px] leading-relaxed text-editorial-navy/60">{active.note}</p>

      <div className="mt-3">
        {active.key === 'badge' && (
          <CredentialBadge person={person} template={template} code={code} year={year} />
        )}
        {active.key === 'pass' && (
          <CredentialPass
            person={person}
            template={template}
            code={code}
            rows={rows}
            hasExisting={hasExisting}
            year={year}
          />
        )}
        {active.key === 'card' && <CredentialCard person={person} code={code} />}
      </div>
    </div>
  );
}