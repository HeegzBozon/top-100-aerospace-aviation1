import { useState } from 'react';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import VerificationLadder from './VerificationLadder';
import { labelOf, hintOf } from './verificationLadder';

// The employer check, worked from the record itself. One address, one code, one
// answer: the badge appears because a mailbox at that domain replied, never because
// someone asked for it.
//
// A record with no account attached has nothing to confirm against, so it is given
// the reason rather than a form it cannot submit.
export default function VerificationPanel({ nominee, onVerified }) {
  const [workEmail, setWorkEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const confirmed = nominee?.verification_status?.employer_verified === true;
  const claimed = nominee?.claim_status === 'approved';

  const invoke = async (payload) => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('verifyWorkEmail', payload);
      return res.data || res;
    } catch (e) {
      return e?.response?.data || { error: e?.message || 'That did not work.' };
    } finally {
      setBusy(false);
    }
  };

  const send = async () => {
    const data = await invoke({
      action: 'request',
      nominee_id: nominee.id,
      work_email: workEmail.trim(),
    });
    if (data.ok && data.already) {
      setNotice(data.message);
      onVerified?.();
      return;
    }
    if (data.ok) {
      setRequestId(data.request_id);
      setNotice(data.message || '');
      setCode('');
      return;
    }
    setNotice('');
    setError(data.error || data.message || 'That did not work.');
  };

  const submit = async () => {
    const data = await invoke({ action: 'confirm', request_id: requestId, code });
    if (data.ok) {
      setRequestId('');
      setCode('');
      setError('');
      setNotice(data.message || 'Your employer is confirmed.');
      onVerified?.(data.nominee);
      return;
    }
    setError(data.message || 'That code did not work.');
  };

  return (
    <section
      aria-labelledby="record-credential"
      className="mt-8 border-t-2 border-editorial-copper pt-8"
    >
      <p className="pd-label">Your credential</p>
      <h2
        id="record-credential"
        className="mt-2 flex items-center gap-2 font-heading text-[22px] leading-tight text-editorial-navy"
      >
        <ShieldCheck className="h-5 w-5 shrink-0 text-editorial-copper" strokeWidth={1.8} />
        {labelOf(nominee)}
      </h2>
      <p className="mt-1.5 max-w-xl font-body text-[13px] leading-relaxed text-editorial-navy/65">
        {hintOf(nominee)}
      </p>

      <VerificationLadder nominee={nominee} />

      {!claimed && (
        <p className="mt-6 border-l-2 border-editorial-copper/40 pl-4 font-body text-[13px] leading-relaxed text-editorial-navy/70">
          This record is not attached to an account yet. Claim it first, then confirm
          the address you work from.
        </p>
      )}

      {claimed && confirmed && (
        <p className="mt-6 flex items-start gap-2.5 border-l-2 border-editorial-copper bg-editorial-sand px-4 py-3 font-body text-[13px] leading-relaxed text-editorial-navy">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-editorial-copper" strokeWidth={2} />
          Your employer is confirmed. This record carries the verified professional
          credential.
        </p>
      )}

      {claimed && !confirmed && (
        <div className="mt-6">
          {requestId ? (
            <>
              <label
                htmlFor="verify-code"
                className="block font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-editorial-label"
              >
                Six-digit code
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  id="verify-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="max-w-[180px] border-editorial-navy/20 bg-white font-body text-[15px] tracking-[0.3em] text-editorial-navy"
                />
                <button
                  type="button"
                  onClick={submit}
                  disabled={busy || code.length !== 6}
                  className="pd-acct-link justify-center disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirm
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRequestId('');
                  setCode('');
                  setNotice('');
                  setError('');
                }}
                className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-editorial-copper hover:text-editorial-navy"
              >
                Use a different address
              </button>
            </>
          ) : (
            <>
              <label
                htmlFor="verify-email"
                className="block font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-editorial-label"
              >
                Work address
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  id="verify-email"
                  type="email"
                  autoComplete="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="you@your-employer.com"
                  className="border-editorial-navy/20 bg-white font-body text-[15px] text-editorial-navy"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={busy || !workEmail.trim()}
                  className="pd-acct-link justify-center whitespace-nowrap disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Send code
                </button>
              </div>
              <p className="mt-2 font-body text-[11px] leading-relaxed text-editorial-navy/55">
                A six-digit code goes to that mailbox. We keep the domain, never the
                address on the public record.
              </p>
            </>
          )}

          {notice && (
            <p className="mt-3 font-body text-[12px] leading-relaxed text-editorial-navy/70">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 font-body text-[12px] leading-relaxed text-destructive">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}