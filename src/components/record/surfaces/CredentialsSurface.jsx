import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import CredentialsDeck from '@/components/my-top100/credentials/CredentialsDeck';
import buildCredentialPerson from '@/components/my-top100/credentials/credentialPerson';

// The Credentials tool on the record.
//
// The business card used to be its own drawer of fields. It is not a drawer: the card is
// one of three printings of the record, and a Fellow should meet all three in the same
// place they meet the card's own lines. So this tool hands over the same deck Pre-Flight
// hands over — assembled from this record by the same reading — and the card's lines stay
// in the checklist above, where they are counted.
export default function CredentialsSurface({ account, nominee, settings, card }) {
  const { person, rows, template, code } = useMemo(
    () => buildCredentialPerson({ user: account, card, nominee, settings }),
    [account, card, nominee, settings],
  );

  return (
    <div className="mt-8">
      <p className="pd-label">Your credentials</p>
      <p className="mt-2 max-w-xl font-body text-[12px] leading-relaxed text-editorial-navy/65">
        One record, printed three ways. The card lines above fill all three; nothing here is
        asked of you twice.
      </p>

      <div className="mt-4 max-w-[23rem]">
        <CredentialsDeck
          person={person}
          template={template}
          code={code}
          rows={rows}
          hasExisting={!!nominee}
          year={new Date().getFullYear()}
        />

        {/* The same deck is handed over in the committee's Pre-Flight. One press takes the
            Fellow to it, so the two are read as one set of credentials rather than two. */}
        <Link
          to="/selection-committee?tab=start&preflight=boarding"
          className="pd-acct-link mt-4 inline-flex"
        >
          See them in Pre-Flight
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}