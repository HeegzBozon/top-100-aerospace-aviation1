import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { BookX, Loader2 } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { chooseWomenIssue } from '@/components/magazine/womenEdition';

// The title screen's TOP 100 Women 2025 key opens the edition itself rather than a page
// about the edition.
//
// The issue is resolved at read time — the newest published Women edition, and the newest
// of any kind where none is published — and the reader's own route takes it from there, so
// the surface is one key, the issue is one address, and the reader keeps every state it
// already has (the opening, the contents, the register, the film).
export default function Women2025Edition() {
  const [state, setState] = useState({ loading: true, issue: null, failed: false });

  useEffect(() => {
    let alive = true;
    base44.entities.MagazineIssue.filter({}, { sort: '-created_date', limit: 50 })
      .then((page) => {
        if (!alive) return;
        setState({ loading: false, issue: chooseWomenIssue(page?.items || []), failed: false });
      })
      .catch(() => alive && setState({ loading: false, issue: null, failed: true }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: P.navyVoid }}>
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: P.gold }} />
      </div>
    );
  }

  if (state.issue) return <Navigate to={`/magazine/${state.issue.id}`} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: P.navyVoid }}>
      <div>
        <BookX className="mx-auto mb-4 h-10 w-10" style={{ color: P.gold }} />
        <h2 className="font-heading text-xl" style={{ color: P.cream }}>
          {state.failed ? 'The edition could not be reached' : 'The 2025 edition is not bound yet'}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.55)' }}>
          {state.failed
            ? 'Nothing is lost. Read it again from the title screen, or open the published edition.'
            : 'The issue is assembled in the Magazine Studio. Until it is published, the edition is read on its own page.'}
        </p>
        <Link
          to="/Top100Women2025"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em]"
          style={{ background: P.gold, color: P.navyVoid }}
        >
          Open the published edition
        </Link>
      </div>
    </div>
  );
}