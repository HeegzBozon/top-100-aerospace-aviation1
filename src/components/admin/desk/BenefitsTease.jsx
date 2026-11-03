// The Benefits tab, sealed. Nothing is promised and nothing is filed here: it is an
// envelope on the desk, wax side up, so the house can see what is being drawn up.
const HELD = ['Health & cover', 'Time away', 'Travel & training'];

export default function BenefitsTease() {
  return (
    <div className="desk-plate px-6 py-10 text-center">
      <div className="desk-seal mx-auto flex h-16 w-16 items-center justify-center">
        <span className="font-heading text-xl leading-none" style={{ color: '#fdf8f0' }}>
          100
        </span>
      </div>

      <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: '#c9a87c' }}>
        Benefits
      </p>
      <h3 className="mx-auto mt-2 max-w-md font-heading text-2xl leading-tight" style={{ color: '#f5efe4' }}>
        Cover, time away, and the perks of the house.
      </h3>
      <p className="mx-auto mt-2.5 max-w-sm text-xs leading-relaxed" style={{ color: '#7d94aa' }}>
        The envelope is sealed and the terms are being drawn. This tab opens when there is
        something on the page worth signing.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {HELD.map((item) => (
          <span
            key={item}
            className="rounded-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: 'rgba(201,168,124,0.78)', border: '1px solid rgba(201,168,124,0.26)' }}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="desk-rule mx-auto mt-7 max-w-xs" />
      <p className="mt-3 text-[10px]" style={{ color: '#5d7a94' }}>
        Nothing to file yet.
      </p>
    </div>
  );
}