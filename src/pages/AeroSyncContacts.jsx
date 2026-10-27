import { useMemo } from 'react';
import HomeDock from '@/components/home-v3/HomeDock';
import AeroSyncWorkbench from '@/components/aerosync/AeroSyncWorkbench';
import { C } from '@/components/crm/crmConfig';

// AeroSync's rolodex. The title screen's keys deep-link in, so the surface opens on the view
// that was asked for: the capture, when the query names it, and the rolodex otherwise.
export default function AeroSyncContacts() {
  const initialTab = useMemo(
    () => (new URLSearchParams(window.location.search).get('tab') === 'capture' ? 'capture' : 'contacts'),
    [],
  );

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-12">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: C.copper }}>
              AeroSync
            </p>
            <h1 className="mt-1 font-heading text-2xl md:text-4xl" style={{ color: C.navy }}>
              Contacts
            </h1>
          </div>
          <p className="text-[11px]" style={{ color: C.muted }}>
            Every contact is private to the Fellow who captured it.
          </p>
        </header>

        <AeroSyncWorkbench initialTab={initialTab} />

        <div className="h-24" />
      </div>
      <HomeDock />
    </div>
  );
}