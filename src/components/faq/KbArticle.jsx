import { B } from '@/components/fellow-home/fellowHomeConfig';

// The body of a knowledge base article, opened inside its row.
//
// The row already carries the title, so the article starts where the copy starts: the
// standfirst in italic serif, then the paragraphs, then any list of terms the module
// carries. Nothing here scrolls or collapses on its own — the wheel walks the rows and
// the glass scrolls the open one.
export default function KbArticle({ module }) {
  return (
    <div>
      {module.lede ? (
        <p
          className="max-w-2xl font-heading text-[13.5px] italic leading-snug md:text-[15px]"
          style={{ color: 'rgba(30,58,90,0.78)' }}
        >
          {module.lede}
        </p>
      ) : null}

      {module.paras?.map((para) => (
        <p
          key={para.slice(0, 24)}
          className="mt-3 max-w-2xl text-[12px] leading-relaxed md:text-[13px]"
          style={{ color: B.muted }}
        >
          {para}
        </p>
      ))}

      {module.terms?.length ? (
        <dl className="mt-3.5 space-y-2">
          {module.terms.map((term, i) => (
            <div key={term.term} className="flex gap-2.5">
              <span className="w-4 shrink-0 pt-[3px] text-[8.5px] font-bold tabular-nums" style={{ color: B.copper }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <dt className="font-heading text-[13.5px] leading-snug" style={{ color: B.navy }}>
                  {term.term}
                </dt>
                <dd className="mt-0.5 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
                  {term.note}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}