import FollowingLedger from '@/components/following/FollowingLedger';
import { C } from '@/components/crm/crmConfig';

// AeroSync's following ledger. The rolodex holds the cards a Fellow captured; this holds
// the people they follow, and reads the two together — the same machine, the same account,
// one press between them.
export default function AeroSyncFollowing() {
  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-12">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: C.copper }}>
              AeroSync
            </p>
            <h1 className="mt-1 font-heading text-2xl md:text-4xl" style={{ color: C.navy }}>
              Following
            </h1>
          </div>
          <p className="text-[11px]" style={{ color: C.muted }}>
            The people you keep, and the cards you hold for them.
          </p>
        </header>

        <FollowingLedger />

        <div className="h-24" />
      </div>
    </div>
  );
}