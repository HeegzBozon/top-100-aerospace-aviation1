import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useNomineeRecord from './useNomineeRecord';

// A name that is already on the record.
//
// The moment what has been typed matches a Fellow the platform holds, the identity questions
// stop being worth asking: the record carries the name, the role and organization, the
// profile address and where they are. The card offers that record back, and taking it is the
// only thing that hides the fields — nothing is filled in behind the nominator's back.
export default function NomineeRecordMatch({ nom, pronoun, onUse }) {
  const { record, checking } = useNomineeRecord({ name: nom.name, email: nom.email, link: nom.link });
  const [declinedId, setDeclinedId] = useState(null);

  if (!record || record.id === declinedId) return null;

  const role = [record.title, record.company].filter(Boolean).join(' at ');
  const place = [record.country].filter(Boolean).join(' · ');

  return (
    <div className="rounded-xl border border-editorial-copper/35 bg-editorial-sand/50 p-4">
      <div className="flex items-center gap-1.5">
        <BadgeCheck className="h-3.5 w-3.5 text-editorial-copper" aria-hidden="true" />
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-label">
          Already on the record
        </p>
      </div>

      <p className="mt-1.5 font-heading text-lg leading-tight text-editorial-navy">{record.name}</p>
      {role && <p className="font-body text-[13px] text-editorial-navy/70">{role}</p>}
      {place && <p className="font-body text-[12px] text-editorial-navy/50">{place}</p>}

      <p className="mt-2 font-body text-[12px] leading-relaxed text-editorial-navy/60">
        We hold {pronoun} name, role and profile, so there is nothing to retype. Use the record
        and tell us why {pronoun} deserves to be recognized.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => onUse(record)}
          className="gap-1.5 bg-editorial-copper text-editorial-cream hover:bg-editorial-copper/90"
        >
          Use this record
        </Button>
        <button
          type="button"
          onClick={() => setDeclinedId(record.id)}
          className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-editorial-navy/50 transition-colors hover:text-editorial-navy"
        >
          Not {pronoun}
        </button>
      </div>
    </div>
  );
}

export function RecordOnFile({ nom, pronoun, onChange }) {
  const role = nom.role_org || '';
  const place = nom.location || '';
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-editorial-copper/35 bg-editorial-sand/40 p-4">
      <div className="min-w-0">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-label">
          On the record
        </p>
        <p className="mt-1 truncate font-heading text-lg leading-tight text-editorial-navy">{nom.name}</p>
        {role && <p className="truncate font-body text-[13px] text-editorial-navy/70">{role}</p>}
        {place && <p className="truncate font-body text-[12px] text-editorial-navy/50">{place}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-editorial-navy/50 transition-colors hover:text-editorial-copper"
        aria-label={`Change which record is used for ${pronoun}`}
      >
        Change
      </button>
    </div>
  );
}