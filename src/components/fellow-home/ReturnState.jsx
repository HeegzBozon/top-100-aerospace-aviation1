import { Link } from 'react-router-dom';
import { B } from './fellowHomeConfig';

// The reason to open this page tomorrow. Lives on the profile, not in a bell.
export default function ReturnState({ newEndorsements, appearances, emptySlots, accent }) {
  const signals = [];

  if (newEndorsements > 0) {
    signals.push({
      key: 'endorsements',
      text: `${newEndorsements} new endorsement${newEndorsements === 1 ? '' : 's'} since you were last here`,
      to: null,
    });
  }
  if (appearances > 0) {
    signals.push({
      key: 'appearances',
      text: `You are in ${appearances} Fellow${appearances === 1 ? "'s" : "s'"} Eight`,
      to: null,
    });
  }
  if (emptySlots > 0) {
    signals.push({
      key: 'slots',
      text: `${emptySlots} of your eight position${emptySlots === 1 ? ' is' : 's are'} still open`,
      to: '/nominate',
    });
  }

  if (signals.length === 0) return null;

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: B.navy }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5" style={{ color: accent }}>
        Since you were last here
      </p>
      <ul className="space-y-1.5">
        {signals.map((s) => (
          <li key={s.key} className="text-sm flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
            {s.to ? (
              <Link to={s.to} className="underline decoration-white/25 hover:decoration-white transition-colors">
                {s.text}
              </Link>
            ) : (
              s.text
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}