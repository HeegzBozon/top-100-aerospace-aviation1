import { useEffect, useRef, useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { MODES, REQUEST_TYPES, TIMELINES } from './intentConfig';

// The private door. A visitor writes; the Fellow reads it in their own desk. The
// address on either side stays unpublished — the submitter's is kept for a reply,
// the Fellow's is never rendered, and the recipient is resolved server-side from
// the profile itself so nothing here can be redirected.
export default function InquirySheet({ nominee, mode, requestType, onClose }) {
  const spec = MODES[mode] || MODES.hire;
  const types = REQUEST_TYPES[mode] || REQUEST_TYPES.hire;
  const name = nominee?.name || 'this Fellow';
  const firstName = name.split(' ')[0];

  const [form, setForm] = useState({
    sender_name: '',
    sender_email: '',
    sender_org: '',
    sender_role: '',
    request_type: types.some((t) => t.key === requestType) ? requestType : types[0].key,
    timeline: 'this_quarter',
    message: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const firstField = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const focus = setTimeout(() => firstField.current?.focus(), 60);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(focus);
    };
  }, [onClose]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const response = await base44.functions.invoke('submitProfileInquiry', {
        nominee_id: nominee?.id,
        mode,
        ...form,
      });
      const data = response && typeof response === 'object' && 'data' in response ? response.data : response;
      if (!data?.success) throw new Error(data?.error || 'That did not send.');
      setStatus('sent');
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'That did not send. Check the details and try again.'
      );
      setStatus('error');
    }
  };

  const field = {
    background: '#fff',
    border: `1px solid ${B.border}`,
    color: B.navy,
  };
  const labelClass = 'mb-1 block text-[9px] font-bold uppercase tracking-[0.2em]';

  return (
    <div
      className="hh-glass-panel hh-form-panel fixed inset-0 z-[120] flex items-end justify-center md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Write to ${name}`}
    >
      <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 cursor-default" style={{ background: 'rgba(7,17,31,0.55)' }} />
      <div
        className="hh-glass-panel-card relative w-full max-w-lg overflow-y-auto scrollbar-hide rounded-t-3xl md:rounded-3xl"
        style={{ background: B.cream, border: `1px solid ${B.gold}55`, boxShadow: '0 30px 90px -30px rgba(7,17,31,0.7)' }}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
              {status === 'sent' ? 'Sent privately' : spec.kicker}
            </p>
            <h2 className="mt-1 font-heading text-[22px] font-semibold leading-tight" style={{ color: B.navy }}>
              {status === 'sent' ? `Your inquiry is with ${firstName}.` : `Write to ${firstName}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ color: B.navy, border: `1px solid ${B.border}` }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="px-5 pb-6 pt-4">
            <p className="text-[13px] leading-relaxed" style={{ color: B.navy }}>
              It has arrived in {firstName}&rsquo;s private desk. No address was exchanged — yours is kept only
              so they can reply.
            </p>
            <ul className="mt-4 space-y-2 text-[12px]" style={{ color: B.muted }}>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: B.copper }} /> Expect a reply within a few working days.</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: B.copper }} /> If they take it forward, they will write to you directly.</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: B.copper }} /> One inquiry per profile per day keeps the desk readable.</li>
            </ul>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full py-3 text-[12px] font-bold uppercase tracking-[0.16em]"
              style={{ background: B.navy, color: '#fff' }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 px-5 pb-6 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={{ color: B.copper }} htmlFor="inq-name">Your name</label>
                <input
                  id="inq-name"
                  ref={firstField}
                  required
                  value={form.sender_name}
                  onChange={set('sender_name')}
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={field}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: B.copper }} htmlFor="inq-email">Email</label>
                <input
                  id="inq-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.sender_email}
                  onChange={set('sender_email')}
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={field}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={{ color: B.copper }} htmlFor="inq-org">Organisation</label>
                <input
                  id="inq-org"
                  value={form.sender_org}
                  onChange={set('sender_org')}
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={field}
                />
              </div>
              <div>
                <label className={labelClass} style={{ color: B.copper }} htmlFor="inq-role">Your role</label>
                <input
                  id="inq-role"
                  value={form.sender_role}
                  onChange={set('sender_role')}
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={field}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} style={{ color: B.copper }} htmlFor="inq-type">Asking for</label>
                <select
                  id="inq-type"
                  value={form.request_type}
                  onChange={set('request_type')}
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={field}
                >
                  {types.map((type) => (
                    <option key={type.key} value={type.key}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ color: B.copper }} htmlFor="inq-timeline">Timing</label>
                <select
                  id="inq-timeline"
                  value={form.timeline}
                  onChange={set('timeline')}
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={field}
                >
                  {TIMELINES.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} style={{ color: B.copper }} htmlFor="inq-message">What you have in mind</label>
              <textarea
                id="inq-message"
                required
                rows={4}
                maxLength={2500}
                value={form.message}
                onChange={set('message')}
                placeholder={`Tell ${firstName} what the role, brief or partnership is — a few sentences is enough.`}
                className="w-full resize-none rounded-lg px-3 py-2 text-[13px] outline-none"
                style={field}
              />
              <p className="mt-1 text-right text-[10px]" style={{ color: B.muted }}>{form.message.length} / 2500</p>
            </div>

            {error && (
              <p className="rounded-lg px-3 py-2 text-[12px]" style={{ background: 'rgba(184,115,51,0.10)', color: B.copper }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[12px] font-bold uppercase tracking-[0.16em] transition-opacity disabled:opacity-60"
              style={{ background: B.copper, color: '#fff' }}
            >
              {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {status === 'sending' ? 'Sending' : 'Send privately'}
            </button>
            <p className="text-center text-[10px] leading-relaxed" style={{ color: B.muted }}>
              Your address is shared only with {firstName}. It is never published.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}