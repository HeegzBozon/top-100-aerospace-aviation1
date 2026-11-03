import { Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C } from '@/components/crm/crmConfig';

// A rolodex is a Fellow's own record of the people they have met, so a visitor has none to
// read. This says that plainly and offers the way in, rather than showing the working list
// with nothing in it — an empty ledger and a failed read look identical otherwise.
export default function DirectoryGuestNote() {
  return (
    <section
      className="rounded-xl p-5"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: C.cream, border: `1px solid ${C.copper}` }}
        >
          <Users className="h-4 w-4" style={{ color: C.copper }} />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-lg" style={{ color: C.navy }}>
            Your directory is kept in your account
          </h2>
          <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
            The people you meet at a conference or on campus are kept on your own record —
            private to you, never shown to anyone else and never read by measurement. Sign in
            and your list is exactly as you left it.
          </p>
          <button
            type="button"
            onClick={() => base44.auth.redirectToLogin('/aerosync/people')}
            className="mt-3 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ background: C.navy, color: C.cream }}
          >
            Sign in to open it
          </button>
          <p className="mt-2 text-[11px]" style={{ color: C.muted }}>
            Looking for someone in aerospace? The Who, What, When and Where tabs below read the
            public record and need no account.
          </p>
        </div>
      </div>
    </section>
  );
}