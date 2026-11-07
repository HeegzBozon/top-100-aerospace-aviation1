import BadgeFront from '@/components/badge/BadgeFront';

// ── The badge ──
//
// The one a Fellow wears: the same object the badge surface prints, on the plate they
// chose, with the code at its foot. It is the flavour that works at arm's length — read
// across a room before a word is said.
export default function CredentialBadge({ person, template, code, year }) {
  return (
    <div className="h-[430px] w-full">
      <BadgeFront
        person={person}
        template={template}
        qrLink={code.link}
        qrTitle={code.title}
        qrNote={code.note}
        showQr
        year={year}
      />
    </div>
  );
}