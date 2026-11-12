// The five routes worth watching: the editions and the viral posts, which are the
// platform's own publishing rather than the front door. A route is listed once however
// many query strings it was opened with.
const CONTENT_ROUTES = /^\/(magazine|viralpost|archive|honoree|editions|Top100Women)/i;

export default function TopContentRoutes({ routes, loading }) {
  const content = (routes || [])
    .filter((row) => CONTENT_ROUTES.test(row.path || ''))
    .slice(0, 5);

  return (
    <div className="desk-plate px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
          Top content routes
        </p>
        <p className="text-[9px] uppercase tracking-[0.16em] text-editorial-cream/45">30 days</p>
      </div>
      <div className="desk-rule mt-2" />

      {loading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-4 animate-pulse rounded bg-editorial-cream/10" />
          ))}
        </div>
      ) : content.length ? (
        <ul className="mt-3 space-y-1.5">
          {content.map((row, index) => (
            <li key={row.path} className="flex items-center gap-2.5">
              <span className="w-3 flex-none font-heading text-[11px] text-editorial-gold/70">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-editorial-cream/80">
                {row.path}
              </span>
              <span className="flex-none text-[11px] tabular-nums text-editorial-cream/55">
                {row.views.toLocaleString('en-US')}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[11px] leading-relaxed text-editorial-cream/55">
          No edition or viral post has been opened in this window. The routes are listed the
          moment one is read.
        </p>
      )}
    </div>
  );
}