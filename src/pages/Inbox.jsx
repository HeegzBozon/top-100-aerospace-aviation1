import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import InboxTriage from '@/components/inbox/InboxTriage';
import InquiryDeskPanel from '@/components/profile/intent/InquiryDeskPanel';

// The Inbox, as its own application: everything that needs an answer, then the enquiry desk.
export default function Inbox() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin(window.location.href));
  }, []);

  if (!user) return <div className="flex min-h-screen items-center justify-center bg-editorial-cream"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>;

  return (
    <div className="min-h-screen bg-editorial-cream px-4 py-6 md:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="pd-label">Inbox <span className="ml-2 hidden normal-case tracking-normal text-editorial-navy/50 md:inline">Wheel walks · ◀ ▶ switch view · confirm opens · back marks done</span></p>
        <h1 className="mt-1 font-heading text-3xl text-editorial-navy">What needs an answer</h1>
        <div className="pd-rule mb-6 mt-3 w-12" />
        <InboxTriage user={user} />
        <div id="enquiries" className="mt-8"><InquiryDeskPanel user={user} /></div>
      </div>
    </div>
  );
}