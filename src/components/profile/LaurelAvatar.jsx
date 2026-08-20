const GOLD = '#c9a87c';

// Laurel wreath branch — mirrored for the right side.
const Branch = ({ flip }) => (
  <svg
    viewBox="0 0 40 100"
    className="absolute top-1/2 -translate-y-1/2 h-[118%] w-auto"
    style={{ [flip ? 'right' : 'left']: '-14%', transform: `translateY(-50%) ${flip ? 'scaleX(-1)' : ''}` }}
    fill="none"
  >
    <path d="M30 6 C10 26, 4 50, 12 94" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
    {[
      [26, 12, -50], [19, 24, -40], [14, 37, -28], [11, 50, -14], [10, 63, 0], [11, 76, 12], [13, 88, 24],
    ].map(([x, y, r], i) => (
      <ellipse key={i} cx={x} cy={y} rx="3.2" ry="7.5" fill={GOLD} transform={`rotate(${r} ${x} ${y})`} opacity={0.92 - i * 0.04} />
    ))}
  </svg>
);

/**
 * Avatar with an optional laurel wreath frame designating a TOP 100 nominee or alumni.
 * designation: null | 'nominee' | 'alumni'
 */
export default function LaurelAvatar({ src, alt, designation, size = 128, className = '' }) {
  const img = (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size, border: '4px solid #faf8f5' }}
    />
  );

  if (!designation) return <div className="mx-auto mb-4 inline-block">{img}</div>;

  return (
    <div className="mx-auto mb-4 inline-block">
      <div className="relative inline-block" style={{ padding: `0 ${Math.round(size * 0.22)}px` }}>
        <Branch />
        {img}
        <Branch flip />
      </div>
      <div
        className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em]"
        style={{ color: GOLD }}
      >
        {designation === 'alumni' ? 'TOP 100 Alumni' : 'TOP 100 Nominee'}
      </div>
    </div>
  );
}