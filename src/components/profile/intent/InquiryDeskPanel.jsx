import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Inbox } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import InquiryRow from './InquiryRow';

// The Fellow's private desk: everything written through the doors on their profile.
// Reads only their own records (the record's access rules hold the line), and the
// status they set here is the record of how the conversation went.
export default function InquiryDeskPanel({ user, accent }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!user?.email) {
      setLoading(false);
      return () => { alive = false; };
    }
    (async () => {
      try {
        const page = await base44.entities.ProfileInquiry.filter(
          { profile_email: user.email },
          { sort: '-created_date', limit: 50 }
        );
        if (alive) setInquiries(page?.items || (Array.isArray(page) ? page : []));
      } catch (err) {
        if (alive) setError('The desk could not be opened just now.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.email]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    const previous = inquiries;
    setInquiries((rows) => rows.map((row) => (row.id === id ? { ...row, status } : row)));
    try {
      await base44.entities.ProfileInquiry.update(id, {
        status,
        status_updated_at: new Date().toISOString(),
      });
    } catch (err) {
      setInquiries(previous);
      setError('That status could not be saved.');
    } finally {
      setBusyId(null);
    }
  };

  const unread = inquiries.filter((row) => row.status === 'new').length;

  return (
    <section className="px-3 pb-4 pt-3">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            The Desk
          </p>
          <h2 className="mt-1.5 font-heading text-[19px] font-semibold leading-tight" style={{ color: B.navy }}>
            Who has written.
          </h2>
        </div>
        {unread > 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ background: `${accent}22`, color: B.navy }}
          >
            {unread} new
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: B.gold }} />
        </div>
      ) : error ? (
        <p className="mt-3 rounded-lg px-3 py-2 text-[11.5px]" style={{ background: 'rgba(184,115,51,0.12)', color: B.copper }}>
          {error}
        </p>
      ) : inquiries.length === 0 ? (
        <div className="mt-3 rounded-2xl px-4 py-6 text-center" style={{ border: `1px dashed ${B.border}`, background: 'rgba(255,255,255,0.6)' }}>
          <Inbox className="mx-auto h-6 w-6" style={{ color: B.gold }} />
          <p className="mt-2 font-heading text-[15px]" style={{ color: B.navy }}>The desk is empty.</p>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
            When a door is open, an inquiry lands here with the sender&rsquo;s own words — nothing
            is routed to your inbox first.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-2.5">
          {inquiries.map((inquiry) => (
            <InquiryRow
              key={inquiry.id}
              inquiry={inquiry}
              accent={accent}
              busy={busyId === inquiry.id}
              onStatus={setStatus}
            />
          ))}
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed" style={{ color: B.muted }}>
        Inquiries are recorded, never scored. They play no part in how the institution
        measures or orders anyone.
      </p>
    </section>
  );
}