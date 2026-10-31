import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { CONFERENCE_APPS, CONFERENCE_LAUNCH_HREF } from './conferenceApps';

// The chrome the three micro-apps share: one navy strip cut with a copper seam, the
// launcher at its left as the way back, and the applications printed as keys with the
// one you are standing in lit. It is the machine's own furniture rather than a page
// header, so moving between the applications never feels like leaving the room — and
// the same strip reads the same on the desk and in the glass.
export default function ConferenceAppBar({ app }) {
  return (
    <div className="cfs-bar sticky top-0 z-30 flex items-center gap-1.5 px-2 py-1.5 md:px-3">
      <Link
        to={CONFERENCE_LAUNCH_HREF}
        aria-label="Back to the Conferences launcher"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] text-editorial-cream/70 transition-colors hover:bg-editorial-cream/10 hover:text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-gold/70"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      <nav className="flex min-w-0 flex-1 items-center gap-1" aria-label="Conference applications">
        {CONFERENCE_APPS.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            aria-current={item.key === app ? 'page' : undefined}
            className={`cfs-tab ${item.key === app ? 'is-active' : ''}`}
            title={item.label}
          >
            <span className="cfs-tab-index">{item.index}</span>
            <span className="truncate">{item.short}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}