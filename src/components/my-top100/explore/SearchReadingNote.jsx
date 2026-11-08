// What the search understood, said plainly.
//
// A broad term reaching a dozen countries should never be a silent widening: the reader is
// told which concept answered, and which words in the field it answered with. It sits under
// the search field, above the cloud, and disappears the moment the query stops naming a
// region.
export default function SearchReadingNote({ plan, members }) {
  if (!plan?.regions?.length) return null;

  const label = plan.regions.map((region) => region.label).join(' · ');
  const shown = members.slice(0, 9);
  const rest = members.length - shown.length;

  return (
    <div className="mt-2 border-l-2 border-editorial-copper/60 pl-2">
      <p className="font-body text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-label">
        Read as {label}
      </p>
      <p className="mt-0.5 font-body text-[9.5px] leading-snug text-editorial-navy/70">
        {shown.length > 0 ? (
          <>
            Answered across {members.length} {members.length === 1 ? 'place' : 'places'} in
            this region: {shown.map((member) => member.label).join(' · ')}
            {rest > 0 ? ` +${rest}` : ''}
          </>
        ) : (
          'Answered by the country written on each record.'
        )}
      </p>
    </div>
  );
}