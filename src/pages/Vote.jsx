import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ConsoleLoading from '@/components/core/ConsoleLoading';
import VoteGate from '@/components/voting/VoteGate';
import VoteSurface from '@/components/voting/VoteSurface';
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
export default function Vote() {
  const [state, setState] = useState({ status: 'checking', user: null });

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

  if (state.status === 'visitor') return <VoteGate />;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <VoteSurface user={state.user} />
    </div>
  );
}