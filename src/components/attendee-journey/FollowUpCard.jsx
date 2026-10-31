import { useMemo, useState } from 'react';
import { Check, Copy, Linkedin, Mail, RotateCcw, Send, Trash2 } from 'lucide-react';
import { copyText } from '@/lib/clipboard';
import {
  B, HEAT, OUTCOMES, RELATIONSHIP_TYPES, composeFollowUp, labelOf, mailtoHref,
} from './journeyConfig';
import { Chip, Field, GhostKey, inputStyle } from './bits';

// One relationship, worked. The draft is built from what the Fellow captured and edited by
// them; it leaves from their own account, on their own timing, and nothing is ever sent by
// the platform. Arming a resurface is only offered at a show both of them list themselves in.
export default function FollowUpCard({ contact, fellowName, sharedShows, onPatch, onDelete }) {
  const [draft, setDraft] = useState(
    contact.follow_up_draft || composeFollowUp(contact, fellowName),
  );
  const [copied, setCopied] = useState(false);

  const meta = useMemo(() => ([
    labelOf(RELATIONSHIP_TYPES, contact.relationship_type),
    contact.heat && labelOf(HEAT, contact.heat),
    contact.company,
  ].filter(Boolean).join(' · ')), [contact]);

  const copy = async () => {
    const ok = await copyText(draft);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1600);
  };

  const markSent = () => onPatch({
    follow_up_draft: draft,
    follow_up_sent: true,
    follow_up_sent_at: new Date().toISOString(),
    last_touch: new Date().toISOString(),
  });

  return (
    <div className="rounded-sm px-3 py-3" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-heading text-[15px] leading-tight" style={{ color: B.navy }}>
            {contact.full_name}
          </p>
          <p className="truncate text-[9.5px] uppercase tracking-[0.12em]" style={{ color: B.muted }}>
            {meta}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5">
          {contact.follow_up_sent && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em]"
              style={{ background: `${B.navy}12`, color: B.navy }}
            >
              Sent
            </span>
          )}
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete the record for ${contact.full_name}`}
            className="rounded-full p-1 transition-opacity hover:opacity-70"
            style={{ color: B.muted }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      {contact.promise && (
        <p className="mt-2 rounded-sm px-2 py-1.5 text-[11px] leading-relaxed" style={{ background: B.cream, color: B.navy }}>
          You promised: {contact.promise}
        </p>
      )}

      <textarea
        rows={5}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => onPatch({ follow_up_draft: draft })}
        className="mt-2 resize-none"
        style={{ ...inputStyle, fontSize: 12 }}
      />

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <GhostKey onClick={copy}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </GhostKey>
        {contact.email && (
          <GhostKey onClick={() => { window.location.href = mailtoHref(contact, draft); }}>
            <Mail className="h-3 w-3" /> Email
          </GhostKey>
        )}
        {contact.linkedin_url && (
          <GhostKey onClick={() => window.open(contact.linkedin_url, '_blank', 'noopener')}>
            <Linkedin className="h-3 w-3" /> LinkedIn
          </GhostKey>
        )}
        {!contact.follow_up_sent && (
          <button
            type="button"
            onClick={markSent}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ background: B.copper, color: '#fff' }}
          >
            <Send className="h-3 w-3" /> Mark sent
          </button>
        )}
      </div>

      <div className="mt-3">
        <Field label="Where it stands">
          <div className="mt-1 flex flex-wrap gap-1.5">
            {OUTCOMES.map((outcome) => (
              <Chip
                key={outcome.key}
                active={(contact.outcome || 'none') === outcome.key}
                onClick={() => onPatch({ outcome: outcome.key, last_touch: new Date().toISOString() })}
              >
                {outcome.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-3 border-t pt-2.5" style={{ borderColor: B.border }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
          Resurface at a shared show
        </p>
        {sharedShows.length === 0 ? (
          <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
            No show ahead where you are both listed. It arms itself when there is one.
          </p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {sharedShows.map((room) => (
              <Chip
                key={room.id}
                active={contact.resurface_enabled && contact.resurface_room_id === room.id}
                onClick={() => (contact.resurface_room_id === room.id && contact.resurface_enabled
                  ? onPatch({ resurface_enabled: false, resurface_room_id: '' })
                  : onPatch({ resurface_room_id: room.id, resurface_enabled: true }))}
              >
                <RotateCcw className="mr-1 inline h-2.5 w-2.5" />
                {room.conference_name}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}