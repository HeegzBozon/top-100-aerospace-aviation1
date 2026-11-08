import { useState } from 'react';
import { X } from 'lucide-react';
import useLoungeCopy from './useLoungeCopy';
import LoungeRoom from './LoungeRoom';
import LoungeInquirySheet from './LoungeInquirySheet';
import LoungeComposer from './LoungeComposer';

// A sponsor lounge, stood inside its own room: the briefing room off the Summit hall, or the
// open table in the corner of the Networking Lounge. It is seated in the room's plate the way
// the theatre and the arcade are, so a visitor never leaves the campus to read the offer.
export default function SponsorLoungePanel({ lounge = 'summit', isAdmin, onClose, onGoRoom, onGo }) {
  const { copy, state, reload } = useLoungeCopy(lounge);
  const [view, setView] = useState({ name: 'room' });

  return (
    <div className="absolute inset-2 z-30 mx-auto flex max-w-4xl flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-editorial-navy shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-editorial-copper/40 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-heading text-lg text-editorial-cream">{copy.label}</p>
          {state === 'error' && (
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-cream/45">House copy</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${copy.label}`}
          className="shrink-0 text-editorial-cream/80 hover:text-editorial-cream"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {view.name === 'form' && view.intent ? (
        <LoungeInquirySheet intent={view.intent} copy={copy} onBack={() => setView({ name: 'room' })} />
      ) : view.name === 'edit' && isAdmin ? (
        <LoungeComposer
          copy={copy}
          onCancel={() => setView({ name: 'room' })}
          onSaved={() => { setView({ name: 'room' }); reload(); }}
        />
      ) : (
        <LoungeRoom
          copy={copy}
          isAdmin={isAdmin}
          onIntent={(intent) => setView({ name: 'form', intent })}
          onEdit={() => setView({ name: 'edit' })}
          onGoRoom={onGoRoom}
          onGo={onGo}
        />
      )}
    </div>
  );
}