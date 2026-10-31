import { useState } from 'react';
import { Check, ChevronDown, Copy, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { copyText } from '@/lib/clipboard';
import { SHARE_CHANNELS, SHARE_CONTEXTS, draftShareCopy } from './studioDrafts';

const pill = (active) =>
  active
    ? { background: B.navy, color: B.cream, border: `1px solid ${B.navy}` }
    : { background: '#fff', color: B.navy, border: `1px solid ${B.border}` };

const fieldStyle = { border: `1px solid ${B.border}`, color: B.navy, background: '#fff' };

// The copy desk. It drafts for one context at a time, from the record the Fellow already
// confirmed, and puts the source lines next to the draft so every claim can be checked
// before it is used. Nothing leaves this page on its own.
export default function ShareCopyStudio({ sources, drafts, onChange }) {
  const [context, setContext] = useState('profile');
  const [channel, setChannel] = useState('linkedin');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setError('');
    setBusy(true);
    setCopied(false);
    try {
      const next = await draftShareCopy({ context, channel, sources });
      setResult(next);
    } catch {
      setError('The desk did not answer. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    const ok = await copyText(`${result.heading}\n\n${result.body}`);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const keep = () => {
    if (!result?.body) return;
    onChange([
      {
        key: `${context}-${channel}-${Date.now()}`,
        context,
        channel,
        heading: result.heading,
        body: result.body,
        sources,
        kept_at: new Date().toISOString(),
      },
      ...(drafts || []),
    ]);
  };

  const remove = (key) => onChange((drafts || []).filter((row) => row.key !== key));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
          What you are sharing
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SHARE_CONTEXTS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setContext(entry.key)}
              aria-pressed={context === entry.key}
              className="rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em]"
              style={pill(context === entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10.5px]" style={{ color: B.muted }}>
          {SHARE_CONTEXTS.find((entry) => entry.key === context)?.note}
        </p>
      </div>

      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
          Where it goes
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SHARE_CHANNELS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setChannel(entry.key)}
              aria-pressed={channel === entry.key}
              className="rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em]"
              style={pill(channel === entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10.5px]" style={{ color: B.muted }}>
          {SHARE_CHANNELS.find((entry) => entry.key === channel)?.note}
        </p>
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
        style={{ background: B.copper, color: B.cream }}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
        {busy ? 'Drafting' : result ? 'Draft again' : 'Draft it'}
      </button>

      {error ? (
        <p className="text-[11px]" style={{ color: '#a33' }}>
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="rounded-xl p-4" style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}>
          <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
            The draft — yours to change
          </p>
          <input
            value={result.heading}
            onChange={(event) => setResult({ ...result, heading: event.target.value })}
            aria-label="Heading"
            className="mt-2 w-full rounded-lg px-3 py-2 font-heading text-[13px]"
            style={fieldStyle}
          />
          <textarea
            value={result.body}
            onChange={(event) => setResult({ ...result, body: event.target.value })}
            aria-label="Copy"
            rows={9}
            className="mt-2 w-full rounded-lg px-3 py-2 text-[12px] leading-relaxed"
            style={fieldStyle}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em]"
              style={{ background: B.navy, color: B.cream }}
            >
              {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={keep}
              className="rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em]"
              style={{ background: '#fff', color: B.navy, border: `1px solid ${B.border}` }}
            >
              Keep this draft
            </button>
          </div>
        </div>
      ) : null}

      <details className="rounded-xl p-3" style={{ background: 'rgba(30,58,90,0.03)', border: `1px solid ${B.border}` }}>
        <summary
          className="flex cursor-pointer items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.22em]"
          style={{ color: B.navy }}
        >
          <ChevronDown className="h-3 w-3" />
          Written from {sources.length} line{sources.length === 1 ? '' : 's'} of your record
        </summary>
        <ul className="mt-2 space-y-1">
          {sources.map((line) => (
            <li key={line} className="text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
              {line}
            </li>
          ))}
        </ul>
      </details>

      {drafts?.length ? (
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
            Kept
          </p>
          <ul className="mt-2 space-y-2">
            {drafts.map((row) => (
              <li
                key={row.key}
                className="rounded-xl p-3"
                style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: B.muted }}>
                    {SHARE_CONTEXTS.find((c) => c.key === row.context)?.label || row.context} ·{' '}
                    {SHARE_CHANNELS.find((c) => c.key === row.channel)?.label || row.channel}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(row.key)}
                    aria-label="Remove this draft"
                    className="shrink-0 rounded-full p-1"
                    style={{ color: B.muted }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                {row.heading ? (
                  <p className="mt-1.5 font-heading text-[13px]" style={{ color: B.navy }}>
                    {row.heading}
                  </p>
                ) : null}
                <p className="mt-1 whitespace-pre-line text-[11.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.74)' }}>
                  {row.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}