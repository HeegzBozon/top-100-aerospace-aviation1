// A reading of the house's audience as one ring: every address falls in exactly one band, so
// the slices always close the circle. Drawn as arcs on a single circle rather than as boxes,
// so the desk can read proportions without a scale.
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SegmentDonut({ slices = [], total = 0, caption = '' }) {
  const live = slices.filter((slice) => slice.value > 0);
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 110 110" className="h-[104px] w-[104px] shrink-0" role="img" aria-label={caption}>
        <circle
          cx="55"
          cy="55"
          r={RADIUS}
          fill="none"
          stroke="rgba(250,248,245,0.07)"
          strokeWidth="13"
        />
        {live.map((slice) => {
          const length = total ? (slice.value / total) * CIRCUMFERENCE : 0;
          const dash = `${length} ${CIRCUMFERENCE - length}`;
          const element = (
            <circle
              key={slice.label}
              cx="55"
              cy="55"
              r={RADIUS}
              fill="none"
              stroke={slice.color}
              strokeWidth="13"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 55 55)"
            />
          );
          offset += length;
          return element;
        })}
        <text
          x="55"
          y="52"
          textAnchor="middle"
          fontSize="19"
          fontWeight="600"
          fill="#efe9dc"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {total.toLocaleString()}
        </text>
        <text
          x="55"
          y="66"
          textAnchor="middle"
          fontSize="7"
          letterSpacing="1.6"
          fill="#7d94aa"
          style={{ textTransform: 'uppercase' }}
        >
          REACHABLE
        </text>
      </svg>

      <div className="min-w-0 flex-1 space-y-1.5">
        {slices.map((slice) => {
          const share = total ? Math.round((slice.value / total) * 100) : 0;
          return (
            <div key={slice.label} className="flex items-baseline gap-2">
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-sm"
                style={{ background: slice.value > 0 ? slice.color : 'rgba(250,248,245,0.14)' }}
              />
              <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: '#a3b8c9' }}>
                {slice.label}
              </span>
              <span
                className="text-[11px] tabular-nums"
                style={{ color: slice.value > 0 ? '#efe9dc' : '#5f7387' }}
              >
                {slice.value.toLocaleString()}
              </span>
              <span className="w-8 text-right text-[10px] tabular-nums" style={{ color: '#7d94aa' }}>
                {share}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}