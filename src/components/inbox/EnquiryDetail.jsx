import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';

const ACTIONS = [
  { status: 'responded', label: 'Mark replied' },
  { status: 'closed', label: 'Close' },
  { status: 'declined', label: 'Decline' },
];

// An enquiry opened in place: what they wrote, a reply by email, and the status
// that records how the conversation went. This is the old desk, inside the Inbox.
export default function EnquiryDetail({ enquiry, onStatus }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const act = async (s) => {
    setBusy(s); setError('');
    await onStatus(s).catch(() => setError('That status could not be saved.'));
    setBusy(null);
  };
  return (
    <div className="mb-3 rounded border border-editorial-navy/10 bg-editorial-cream px-3 py-3">
      {enquiry.sender_role && <p className="pd-label">{enquiry.sender_role}</p>}
      <p className="mt-1 whitespace-pre-line font-body text-sm text-editorial-navy">{enquiry.message || 'No message was left.'}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <a href={`mailto:${enquiry.sender_email}`} className="inline-flex items-center gap-1 rounded bg-editorial-copper px-2.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-editorial-cream">
          <Mail className="h-3.5 w-3.5" /> Reply
        </a>
        {ACTIONS.filter((a) => a.status !== enquiry.status).map((a) => (
          <button key={a.status} disabled={!!busy} onClick={() => act(a.status)}
            className="inline-flex items-center gap-1 rounded border border-editorial-navy/20 px-2.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-editorial-navy disabled:opacity-50">
            {busy === a.status && <Loader2 className="h-3 w-3 animate-spin" />}{a.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 font-body text-xs text-destructive">{error}</p>}
    </div>
  );
}