import { useRef, useState } from 'react';
import { Camera, Loader2, PenLine, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C } from './crmConfig';

// The card in a hand, read into a draft. The photograph is uploaded privately — the
// card never sits behind a public URL — and the reading is done from a short-lived
// signed link, so the machine can see it without the card being loose on the web.
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
    <section
      className="mt-6 rounded-2xl p-5"
      style={{ background: C.paper, border: `1px dashed ${C.copper}66` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: C.copper }}>
            Capture a card
          </p>
          <h2 className="mt-1.5 font-heading text-xl md:text-2xl" style={{ color: C.navy }}>
            Handed a card at the show?
          </h2>
          <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
            Photograph it. The card is read into a draft you check and correct before it is saved —
            stored privately, in your rolodex alone.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => readCard(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] disabled:opacity-60"
            style={{ background: C.navy, color: C.cream }}
          >
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading the card
              </>
            ) : (
              <>
                <Camera className="h-3.5 w-3.5" /> Photograph the card
              </>
            )}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onManual}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] disabled:opacity-60"
            style={{ border: `1px solid ${C.border}`, color: C.navy, background: C.surface }}
          >
            <PenLine className="h-3.5 w-3.5" /> Type it in
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-center justify-between gap-3" style={{ color: C.copper }}>
          <p className="text-[11.5px] leading-relaxed">{error}</p>
          <button
            type="button"
            onClick={() => setError('')}
            className="inline-flex shrink-0 items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            <RotateCcw className="h-3 w-3" /> Again
          </button>
        </div>
      ) : null}
    </section>
  );
}