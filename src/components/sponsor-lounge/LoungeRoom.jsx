import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Pencil } from 'lucide-react';
import { FIREWALL, INTENTS, PATRONAGE_LABEL } from './loungeConfig';
import SponsorDialogue from './SponsorDialogue';

const LABEL = 'text-[9px] font-bold uppercase tracking-[0.22em]';

// The room itself. The Summit is a printed agenda — the hosted half of the conversation.
// The Networking Lounge is the desk: it asks what the reader is trying to do, then shows the
// rung of the ladder that answers it, priced from the published rate card. Both credit a
// Patron of Record, and neither sells a position.
export default function LoungeRoom({ copy, isAdmin, onIntent, onPay, onEdit, onGoRoom, onGo }) {
  const selling = copy.key === 'networking';
  const [drawn, setDrawn] = useState(0);
  const opener = copy.icebreakers.length ? copy.icebreakers[drawn % copy.icebreakers.length] : '';

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="px-5 py-6 md:px-8 md:py-7">
        <p className={`${LABEL} text-editorial-gold`}>{copy.eyebrow}</p>
        <h3 className="mt-2 font-heading text-[1.6rem] leading-tight text-editorial-cream md:text-[2rem]">
          {copy.headline}
        </h3>
        <div className="mt-4 h-px w-14 bg-editorial-copper" />
        <p className="mt-4 max-w-[58ch] text-[12.5px] leading-relaxed text-editorial-cream/75">{copy.welcome}</p>
      </div>

      {selling ? (
        <SponsorDialogue copy={copy} onIntent={onIntent} onPay={onPay} onGo={onGo} />
      ) : (
        <div className="bg-editorial-cream px-5 py-6 md:px-8">
          <p className="pd-label">How the briefing runs</p>
          <ol className="mt-3 divide-y divide-editorial-navy/12 border-y border-editorial-navy/12">
            {copy.agenda.map((item, index) => (
              <li key={item.key} className="flex gap-4 py-3">
                <span className="w-6 shrink-0 font-heading text-[15px] text-editorial-copper">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-[15px] leading-snug text-editorial-navy">{item.label}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-editorial-navy/65">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          {copy.prompts.length > 0 && (
            <div className="mt-5">
              <p className="pd-label">What to ask</p>
              <ul className="mt-2 space-y-2">
                {copy.prompts.map((prompt) => (
                  <li key={prompt.key} className="border-l-2 border-editorial-copper/70 pl-3">
                    <p className="font-heading text-[14.5px] leading-snug text-editorial-navy">{prompt.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {opener && (
            <div className="mt-5 border-t border-editorial-copper/40 pt-4">
              <p className="pd-label">If the ice is not broken</p>
              <p className="mt-2 font-heading text-[16px] leading-snug text-editorial-navy">“{opener}”</p>
              <button
                type="button"
                onClick={() => setDrawn((n) => n + 1)}
                className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-copper hover:underline"
              >
                Draw another
              </button>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-editorial-copper/30 px-5 py-5 md:px-8">
        <p className={`${LABEL} text-editorial-gold`}>Patron of Record</p>
        {copy.patron_name ? (
          <>
            <p className="mt-2 font-heading text-[1.15rem] text-editorial-cream">{copy.patron_name}</p>
            {copy.patron_note && (
              <p className="mt-1 text-[11.5px] leading-relaxed text-editorial-cream/70">{copy.patron_note}</p>
            )}
          </>
        ) : (
          <p className="mt-2 max-w-[52ch] text-[12px] leading-relaxed text-editorial-cream/70">
            {selling
              ? 'The patronage of this room is open for the season. A patron’s name is credited here — never a position, a Fellow, or a vote.'
              : 'The patronage of this room is open for the season. Ask below, and the credit carries the patron’s name — never a position, a Fellow, or a vote.'}
          </p>
        )}
        <p className="mt-2 max-w-[56ch] text-[10.5px] leading-relaxed text-editorial-cream/45">{FIREWALL}</p>
      </div>

      <div className="border-t border-editorial-copper/30 px-5 py-5 md:px-8">
        {!selling && (
          <>
            <p className={`${LABEL} text-editorial-cream/55`}>The next step</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button type="button" onClick={() => onIntent(INTENTS[0])} className="desk-key desk-key-primary">
                {INTENTS[0].label} <ArrowRight className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => onIntent(INTENTS[1])} className="desk-key">
                {INTENTS[1].label}
              </button>
              <button type="button" onClick={() => onGo(copy.patronage_url || '/mediakit')} className="desk-key desk-key-quiet">
                {PATRONAGE_LABEL} <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </>
        )}

        <div
          className={`flex flex-wrap items-center justify-between gap-3 ${
            selling ? '' : 'mt-4 border-t border-editorial-cream/10 pt-3'
          }`}
        >
          <button
            type="button"
            onClick={() => onGoRoom(copy.handoff.room)}
            className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-editorial-cream/70 hover:text-editorial-cream"
          >
            {copy.handoff.label} →
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.18em] text-editorial-cream/45 hover:text-editorial-cream"
            >
              <Pencil className="h-3 w-3" /> Edit this room
            </button>
          )}
        </div>
      </div>
    </div>
  );
}