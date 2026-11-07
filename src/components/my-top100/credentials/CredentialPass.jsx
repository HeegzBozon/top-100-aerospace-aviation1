import CredentialCode from '@/components/my-top100/credentials/CredentialCode';

// ── The boarding pass ──
//
// The flavour carried to a desk: the record laid out as a pass, on the Fellow's own plate,
// so the person receiving it can read who is standing in front of them before anything is
// asked for. Every line is drawn from the record already held.
const LABEL = 'font-body text-[8px] font-bold uppercase tracking-[0.2em]';

const initialsOf = (name) =>
  String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export default function CredentialPass({ person, template, code, rows, hasExisting, year }) {
  return (
    <div
      className="relative flex w-full flex-col overflow-hidden rounded-[18px]"
      style={{
        background: template.stock,
        boxShadow: `inset 0 0 0 1px ${template.edge}, 0 26px 50px -32px rgba(3,8,15,0.9)`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${template.grain} 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${template.grain} 0 1px, transparent 1px 4px)`,
          opacity: 0.6,
        }}
      />

      <div className="relative flex justify-center pt-3">
        <div
          className="h-[6px] w-12 rounded-full"
          style={{ background: 'rgba(3,8,15,0.55)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.72)' }}
        />
      </div>

      <div
        className="relative mx-3 mt-2 rounded-[6px] px-3 py-2"
        style={{
          background: template.band,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 ${template.ruleSoft}`,
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className={LABEL} style={{ color: template.rule }}>
            Selection Committee
          </p>
          <p className={`${LABEL} truncate`} style={{ color: 'rgba(250,248,245,0.66)' }}>
            {hasExisting ? 'Returning' : 'First flight'}
          </p>
        </div>
      </div>

      <div className="relative flex flex-col items-center px-4 pb-4 pt-5 text-center">
        <div
          className="h-[76px] w-[76px] rounded-full"
          style={{ boxShadow: `0 0 0 1px ${template.ruleSoft}, 0 16px 28px -18px rgba(3,8,15,0.95)` }}
        >
          {person.portrait ? (
            <img src={person.portrait} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <span
              className="grid h-full w-full place-items-center rounded-full font-heading text-[26px]"
              style={{ background: template.plate, color: '#1E3A5A' }}
            >
              {initialsOf(person.name) || '—'}
            </span>
          )}
        </div>

        <p
          className="mt-3 max-w-[16rem] font-heading text-[22px] leading-[1.12]"
          style={{ color: template.ink, textShadow: template.engrave }}
        >
          {person.name || 'Your record is still blank'}
        </p>
        {person.role && (
          <p
            className="mt-1.5 max-w-[16rem] font-body text-[8.5px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: template.inkSoft }}
          >
            {person.role}
          </p>
        )}
        {person.org && (
          <p className="mt-1 max-w-[16rem] font-body text-[11px]" style={{ color: template.ink }}>
            {person.org}
          </p>
        )}
      </div>

      {rows.length > 0 && (
        <>
          <div className="relative mx-4" style={{ borderTop: `1px dashed ${template.ruleSoft}` }} />
          <dl className="relative grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4">
            {rows.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className={LABEL} style={{ color: template.inkSoft }}>
                  {row.label}
                </dt>
                <dd className="mt-0.5 truncate font-body text-[12px] capitalize" style={{ color: template.ink }}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <CredentialCode
        code={code}
        size={72}
        rule={template.ruleSoft}
        background={template.plate}
        className="relative mx-3 mb-3"
      />

      <div className="relative flex items-center justify-between px-4 pb-3">
        <p className={LABEL} style={{ color: template.inkSoft }}>
          Fellow
        </p>
        <p className={LABEL} style={{ color: template.inkSoft }}>
          {year}
        </p>
      </div>
    </div>
  );
}