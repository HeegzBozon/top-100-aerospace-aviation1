import { brand } from '@/components/nominate/NominateConfig';

// The window the ballot counts in, read once: whether it is open, what it asks for,
// and the institution's line. Every state the cycle can be in is a state of this
// panel — it never shows a blank where the answer should be.
export default function GlassVoteWindow({ status }) {
  const { open, closed, endLabel, ranked, minimum } = status;

  const head = open
    ? 'The ballot is counting'
    : closed
      ? 'Voting has closed'
      : 'The ballot opens with the window';

  const line = open
    ? `Voting${endLabel ? ` closes ${endLabel}` : ' is open'} — your ranked list counts as your ballot, and it counts as you change it.`
    : closed
      ? `The window for this cycle has closed. Your list of ${ranked} stays on your profile and on your public page.`
      : `The window is not open yet. Rank your list now — it becomes your ballot the moment the window opens.`;

  const facts = [
    { label: 'Ranked', value: String(ranked) },
    { label: 'Minimum', value: String(minimum) },
    { label: 'Window', value: open ? 'Open' : closed ? 'Closed' : 'Not open' },
  ];

  return (
    <div className="px-3 pb-6 pt-3.5">
      <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: brand.gold }}>
        The window
      </p>

      <h1
        className="mt-1.5 font-heading text-[17px] font-semibold leading-tight"
        style={{ color: brand.navy }}
      >
        {head}
      </h1>

      <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: `${brand.navy}70` }}>
        {line}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="rounded-xl px-2.5 py-2"
            style={{ background: 'rgba(255,255,255,0.66)', border: `1px solid ${brand.navy}12` }}
          >
            <p
              className="text-[7.5px] font-bold uppercase tracking-[0.2em]"
              style={{ color: `${brand.navy}45` }}
            >
              {fact.label}
            </p>
            <p className="mt-0.5 font-heading text-[14px]" style={{ color: brand.navy }}>
              {fact.value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10.5px] leading-relaxed" style={{ color: `${brand.navy}55` }}>
        Three names are the threshold. Below it nothing is counted rather than a partial ballot being
        stored. You rank; the institution measures.
      </p>
    </div>
  );
}