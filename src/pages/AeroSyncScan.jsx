import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import ContactCapture from '@/components/crm/ContactCapture';
import useConferenceContacts from '@/components/crm/useConferenceContacts';
import { C } from '@/components/crm/crmConfig';

// AeroSync's Scan: a card photographed or typed, read into a draft, corrected, and only then
// written. It stands on its own surface because it is the one thing a Fellow does with a phone
// in their hand at a show — one press on the title screen and the camera is the page.
export default function AeroSyncScan() {
  const crm = useConferenceContacts();
  const [notice, setNotice] = useState('');

  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-12">
        <header>
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: C.copper }}>
            AeroSync
          </p>
          <h1 className="mt-1 font-heading text-2xl md:text-4xl" style={{ color: C.navy }}>
            Scan
          </h1>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
            Photograph a card, or type one in. It is read into a draft you check before anything is
            written, and kept privately in your own rolodex.
          </p>
        </header>

        {notice ? (
          <p
            role="status"
            className="mt-4 inline-flex flex-wrap items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: C.copper }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> {notice}
            <Link to="/aerosync/people" className="ml-1 inline-flex items-center gap-1" style={{ color: C.navy }}>
              Open People <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        ) : null}

        <section
          className="mt-5 rounded-xl p-3 md:p-4"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <ContactCapture
            crm={crm}
            onSaved={(name) => setNotice(`${name} added to your people`)}
          />
        </section>

        <div className="mt-4">
          <Link
            to="/aerosync/people"
            className="inline-flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em]"
            style={{ color: C.navy }}
          >
            Everyone you keep <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}