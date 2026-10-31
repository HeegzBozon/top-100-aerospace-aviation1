import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Loader2, Send } from 'lucide-react';
import { B } from './conferenceConfig';

const STATUS_COPY = {
  pending: {
    label: 'In review',
    body: 'The application is with the house. Nothing else is needed from you — you will be told when the door opens.',
  },
  declined: {
    label: 'Not approved',
    body: 'This application was not approved. Revise it below and submit it again; it returns to the queue.',
  },
  suspended: {
    label: 'Suspended',
    body: 'Publishing is paused on this account. Revise the application below to return it to review.',
  },
};

// The host-approval path. An organizer applies once, and the record that comes back is the
// credential the workspace reads. The form never writes a status: it asks, and the house
// answers.
export default function HostApplication({ application, onApply, onCancel }) {
  const [form, setForm] = useState({
    organization: application?.organization || '',
    role_title: application?.role_title || '',
    website: application?.website || '',
    reason: application?.reason || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const ready = form.organization.trim() && form.reason.trim();
  const status = application?.status;
  const statusCopy = STATUS_COPY[status];

  const submit = async () => {
    if (!ready) return;
    setBusy(true);
    setError('');
    try {
      await onApply(form);
    } catch (submitError) {
      setError(submitError?.message || 'The application could not be sent. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5 md:px-8 md:pb-16 md:pt-10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: B.muted }}
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        )}

        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
          Host approval
        </p>
        <h1 className="mt-1 font-heading text-[26px] leading-tight md:text-4xl" style={{ color: B.navy }}>
          Stage a conference on the network.
        </h1>
        <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
          Hosts publish the conferences the rest of the community finds: the dates, the rooms,
          the record that outlives the show. Tell us who you stage for, and the house opens the
          workspace once the application is approved.
        </p>

        {statusCopy && (
          <div
            className="mt-4 flex items-start gap-2 rounded-sm px-3 py-2.5"
            style={{
              background: status === 'pending' ? `${B.gold}14` : '#fff',
              border: `1px solid ${status === 'pending' ? `${B.gold}55` : B.border}`,
            }}
          >
            {status === 'pending'
              ? <Clock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: B.copper }} />
              : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: B.muted }} />}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: B.navy }}>
                {statusCopy.label}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
                {statusCopy.body}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
          <Field label="Who stages the conference *" value={form.organization} onChange={set('organization')} placeholder="Organization, society or company" />
          <Field label="Your role" value={form.role_title} onChange={set('role_title')} placeholder="e.g. Programme Director" />
          <Field label="Website" value={form.website} onChange={set('website')} placeholder="https://" type="url" />

          <label className="mt-3 block">
            <span className="mb-1 block text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
              Why you host *
            </span>
            <textarea
              value={form.reason}
              onChange={set('reason')}
              rows={4}
              placeholder="The conferences you stage, who attends, and what the community should be able to find there."
              className="w-full resize-none rounded-sm px-2.5 py-2 text-[12.5px]"
              style={{ background: B.cream, border: `1px solid ${B.border}`, color: B.navy }}
            />
          </label>

          {error && <p className="mt-2 text-[11.5px]" style={{ color: '#8c2f2f' }}>{error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={busy || !ready}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] disabled:opacity-40"
            style={{ background: B.copper, color: '#fff' }}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {application && application.status !== 'approved' ? 'Resubmit application' : 'Apply to host'}
          </button>
        </div>

        <p className="mt-3 text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
          Host approval covers publishing conferences and their rooms. It carries no weight in
          measurement, selection or the directory — it is a door, not a standing.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="mt-2 block first:mt-0">
      <span className="mb-1 block text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-sm px-2.5 py-2 text-[12.5px]"
        style={{ background: B.cream, border: `1px solid ${B.border}`, color: B.navy }}
      />
    </label>
  );
}