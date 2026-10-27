import { useRef, useState } from 'react';
import { Camera, Loader2, PenLine, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { BTN_BASE, C } from './crmConfig';

// The card in a hand, read into a draft. The photograph is uploaded privately — the card
// never sits behind a public URL — and the reading is done from a short-lived signed link,
// so the machine can see it without the card being loose on the web.
const CARD_SCHEMA = {
  type: 'object',
  properties: {
    full_name: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    role_title: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    linkedin_url: { type: 'string' },
    website: { type: 'string' },
    city: { type: 'string' },
    country: { type: 'string' },
  },
};

const PROMPT = `Read this photographed business card and return only what is actually printed on it.

Rules:
- Never invent or complete a value. If a field is not printed, or is not legible, return an empty string for it.
- Keep names, organizations and roles spelled exactly as printed. Do not tidy, translate or expand anything.
- full_name is the person's name as printed; fill first_name and last_name from it when the card separates them.
- linkedin_url: return the full https:// URL when a LinkedIn address is printed, otherwise empty.
- website: the organization's or the person's web address, as printed.
- phone: the telephone number as printed, keeping its spacing.
- city and country: fill them only when they appear on the card.`;

const TILE_BASE =
  'flex items-start gap-3 rounded-lg px-3.5 py-3.5 text-left transition-colors disabled:opacity-60';

export default function BusinessCardCapture({ onDraft, onManual }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const readCard = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri,
        expires_in: 3600,
      });
      const reading = await base44.integrations.Core.InvokeLLM({
        prompt: PROMPT,
        file_urls: [signed_url],
        response_json_schema: CARD_SCHEMA,
      });
      onDraft(reading || {}, file_uri);
    } catch {
      setError('The card could not be read. Type it in by hand — nothing is lost.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <section className="rounded-lg p-4" style={{ background: C.paper, border: `1px dashed ${C.copper}66` }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
        Add a card
      </p>
      <p className="mt-1.5 text-[13px] font-semibold" style={{ color: C.navy }}>
        Photograph the card, or type it in.
      </p>
      <p className="mt-1 max-w-lg text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
        A photographed card is read into a draft you check and correct before anything is written.
        The card is stored privately, in your rolodex alone.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => readCard(event.target.files?.[0])}
      />

      <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={TILE_BASE}
          style={{ background: C.copper, color: C.cream }}
        >
          {busy ? <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" /> : <Camera className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em]">
              {busy ? 'Reading the card' : 'Photograph the card'}
            </span>
            <span className="mt-0.5 block text-[11px] normal-case tracking-normal opacity-80">
              {busy ? 'The draft opens when it is read' : 'Read into a draft you correct'}
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onManual}
          className={TILE_BASE}
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.navy }}
        >
          <PenLine className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.copper }} />
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em]">Type it in</span>
            <span className="mt-0.5 block text-[11px] normal-case tracking-normal" style={{ color: C.muted }}>
              Add a contact by hand
            </span>
          </span>
        </button>
      </div>

      {error ? (
        <div className="mt-3.5 flex items-center justify-between gap-3" style={{ color: C.copper }}>
          <p className="text-[11.5px] leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => setError('')}
            className={BTN_BASE}
            style={{ border: `1px solid ${C.border}`, color: C.navy, background: C.surface }}
          >
            <RotateCcw className="h-3 w-3" /> Again
          </button>
        </div>
      ) : null}
    </section>
  );
}