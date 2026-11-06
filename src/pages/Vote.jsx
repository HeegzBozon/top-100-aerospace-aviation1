import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ConsoleLoading from '@/components/core/ConsoleLoading';
import VoteGate from '@/components/voting/VoteGate';
import VoteSurface from '@/components/voting/VoteSurface';
import VoteWalkthrough from '@/components/voting/VoteWalkthrough';
import { isViewingAsVisitor } from '@/lib/viewerPreview';

// One address for the ballot, and the two people who open it.
//
// /vote is the link that gets promoted — in a post, an email, a message to a Fellow —
// so it has to work for whoever is on the other end of it without a query string and
// without a second hop. A Fellow goes straight to the weighing itself rather than the
// hub it normally sits inside; a visitor is given the invitation and sent through the
// platform's own door, which returns them here.
//
// The check is the app's own: an unreachable answer opens the surface as a visitor
// rather than holding it, and a redirect can always be refused.

// The channel a promoted link came through, carried in the query string as ?src=:
// a post, an email, a badge read off a conference table. Only a short slug is ever
// read, so nothing a sender puts in the address can reach a record or a log.
const SOURCE_PATTERN = /^[a-z0-9_-]{1,32}$/i;

function readSource() {
  try {
    const raw = new URLSearchParams(window.location.search).get('src') || '';
    return SOURCE_PATTERN.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

export default function Vote() {
  const [state, setState] = useState({ status: 'checking', user: null });
  const [source] = useState(readSource);
  const [walkthrough, setWalkthrough] = useState(false);

  // Recorded once, and only for a tagged arrival: an untagged ballot is already
  // counted by the page view, and a channel is only worth reporting when it was named.
  useEffect(() => {
    if (!source) return;
    base44.analytics.track({ eventName: 'ballot_link_open', properties: { source } });
  }, [source]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const authenticated = isViewingAsVisitor() ? false : await base44.auth.isAuthenticated();
        if (!active) return;
        if (!authenticated) {
          setState({ status: 'visitor', user: null });
          return;
        }
        const me = await base44.auth.me();
        if (!active) return;
        setState({ status: 'fellow', user: me });
      } catch {
        if (active) setState({ status: 'visitor', user: null });
      }
    })();
    return () => { active = false; };
  }, []);

  if (state.status === 'checking') return <ConsoleLoading label="Opening the ballot" />;

  if (state.status === 'visitor') return <VoteGate source={source} />;
  if (walkthrough && state.user?.role === 'admin') {
    return <div className="imac-fit flex min-h-0 flex-1 flex-col overflow-hidden" data-tube-fill=""><VoteWalkthrough user={state.user} onClose={() => setWalkthrough(false)} /></div>;
  }

  return (
    // The wrapper takes the tube's own fill contract: the glass measures the ballot
    // against itself, so the cream plate ends on the picture's bottom edge.
    <div className="imac-fit flex flex-1 flex-col overflow-hidden" data-tube-fill="">
      {state.user?.role === 'admin' && (
        <div className="shrink-0 bg-editorial-cream px-4 py-2">
          <button type="button" className="desk-key desk-key-primary" onClick={() => setWalkthrough(true)}>Preview new Fellow journey</button>
        </div>
      )}
      <VoteSurface user={state.user} />
    </div>
  );
}