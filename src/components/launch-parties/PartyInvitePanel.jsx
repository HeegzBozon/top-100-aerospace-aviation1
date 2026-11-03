import { useState } from 'react';
import { Check, Copy, Loader2, Mail } from 'lucide-react';
import { sendLaunchPartyInvite } from '@/functions/sendLaunchPartyInvite';
import { PARTY, inviteLink } from './partyConfig';

const field = {
  background: '#ffffff',
  border: `1px solid ${PARTY.ruleOnPaper}`,
  color: PARTY.inkOnPaper,
};

// The invitation desk. Two ways in: the card itself, sent to an address, and the link, which
// a host can hand over anywhere. An address the network cannot reach is reported as it is
// rather than promised, and the link is offered in its place.
export default function PartyInvitePanel({ party }) {
  const [emails, setEmails] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const link = inviteLink(party?.invite_code);

  const send = async (event) => {
    event.preventDefault();
    const list = emails
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (!list.length) {
      setResult({ error: 'Add at least one address.' });
      return;
    }
    setBusy(true);
    try {
      const response = await sendLaunchPartyInvite({ code: party.invite_code, emails: list });
      const data = response?.data || {};
      if (data.error) {
        setResult({ error: data.error });
      } else {
        setResult({ sent: data.sent || 0, results: data.results || [] });
        setEmails('');
      }
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const refused = (result?.results || []).filter((r) => !r.sent);

  return (
    <section className="rounded-lg p-4" style={{ background: PARTY.paper, border: `1px solid ${PARTY.ruleOnPaper}` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: PARTY.copper }}>Send the invitation</p>

      <form onSubmit={send} className="mt-2.5">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: PARTY.bodyOnPaper }}>Addresses</span>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={3}
            placeholder="one@address.com, another@address.com"
            className="mt-1 w-full resize-none rounded px-2 py-2 text-sm outline-none"
            style={field}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] disabled:opacity-50"
          style={{ background: PARTY.copper, color: '#fdf8f0' }}
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
          Send invites
        </button>
      </form>

      {result?.error && <p className="mt-2.5 text-xs font-semibold text-red-700">{result.error}</p>}
      {result?.sent > 0 && (
        <p className="mt-2.5 text-xs" style={{ color: '#2f6b4f' }}>
          {result.sent} invitation{result.sent === 1 ? '' : 's'} on the way.
        </p>
      )}
      {refused.length > 0 && (
        <div className="mt-2 text-xs leading-relaxed" style={{ color: PARTY.bodyOnPaper }}>
          <p>These could not be reached by mail. Hand them the link below instead:</p>
          <ul className="mt-1 list-disc pl-4">
            {refused.map((r) => (
              <li key={r.email}>{r.email} · {r.reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 border-t pt-3" style={{ borderColor: PARTY.ruleOnPaper }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: PARTY.bodyOnPaper }}>Or hand over the link</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <input readOnly value={link} aria-label="Invitation link" className="min-w-0 flex-1 rounded px-2 py-1.5 text-[11px] outline-none" style={field} />
          <button
            type="button"
            onClick={copy}
            className="inline-flex flex-none items-center gap-1 rounded px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ background: '#1e3a5a', color: '#faf8f5' }}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </section>
  );
}