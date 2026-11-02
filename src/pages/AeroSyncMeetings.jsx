import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C } from '@/components/crm/crmConfig';
import BookMeetingForm from '@/components/meetings/BookMeetingForm';
import MeetingRow from '@/components/meetings/MeetingRow';

// AeroSync Meetings: ask anyone in the network for time, and answer who has asked you.
export default function AeroSyncMeetings() {
  const params = new URLSearchParams(window.location.search);
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState({ incoming: [], outgoing: [] });
  const [status, setStatus] = useState('loading');

  const load = useCallback(async (me) => {
    const [incoming, outgoing] = await Promise.all([
      base44.entities.MeetingRequest.filter({ recipient_email: me.email }, '-start_time', 100),
      base44.entities.MeetingRequest.filter({ requester_email: me.email }, '-start_time', 100),
    ]);
    setRows({ incoming, outgoing });
    setStatus('ready');
  }, []);

  useEffect(() => {
    base44.auth.me().then((me) => { setUser(me); return load(me); })
      .catch((e) => (e?.status === 401 ? base44.auth.redirectToLogin(window.location.href) : setStatus('error')));
  }, [load]);

  const onStatus = async (m, s) => { await base44.entities.MeetingRequest.update(m.id, { status: s }); load(user); };

  const section = (title, list, incoming) => (
    <section className="mt-6">
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#8F5C2C' }}>{title}</h2>
      {list.length ? <div className="grid gap-2">{list.map((m) => <MeetingRow key={m.id} m={m} incoming={incoming} onStatus={onStatus} />)}</div>
        : <p className="rounded-lg border border-dashed p-4 text-xs" style={{ borderColor: C.border, color: C.muted }}>{incoming ? 'No one has asked for your time yet.' : 'You have not requested any meetings yet.'}</p>}
    </section>
  );

  return (
    <div className="min-h-screen px-4 py-6 md:px-8" style={{ background: C.cream }}>
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5" style={{ color: '#B87333' }} />
          <h1 className="font-heading text-2xl" style={{ color: C.navy }}>Book a meeting</h1>
        </header>
        {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.navy }} />}
        {status === 'error' && <p className="text-sm text-red-700">Meetings could not load. Try again shortly.</p>}
        {status === 'ready' && <>
          <BookMeetingForm user={user} initialName={params.get('with') || ''} source={params.get('from') || 'aerosync'} onBooked={() => load(user)} />
          {section('Asked of you', rows.incoming, true)}
          {section('You asked', rows.outgoing, false)}
        </>}
        <div className="h-24" />
      </div>
    </div>
  );
}