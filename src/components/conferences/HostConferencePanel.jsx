import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ExternalLink, Pencil } from 'lucide-react';
import AvatarCluster from '@/components/conference-room/AvatarCluster';
import VerifyAttendanceButton from '@/components/conference-room/VerifyAttendanceButton';
import ConferenceEditor from './ConferenceEditor';
import {
  B, conferenceHref, dateRangeLabel, disciplineLabel, domainAccent, phaseForRoom, placeLabel,
} from './conferenceConfig';

const STATUS_LABEL = {
  draft: 'Draft',
  open: 'Open',
  live: 'Live',
  closed: 'Closed',
  archived: 'Archived',
};

// One conference as its host manages it: the standing, the room count, the Fellows declared,
// and the two acts that belong to a host — editing the record, and verifying the attendance
// that becomes the archive.
export default function HostConferencePanel({ room, attendees = [], user, onSaved, onReload }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const accent = domainAccent(room.domain_focus) || B.copper;
  const ended = phaseForRoom(room) === 'done';

  return (
    <div className="rounded-sm" style={{ background: '#fff', border: `1px solid ${B.border}`, borderLeft: `2px solid ${accent}` }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
            {STATUS_LABEL[room.status] || room.status}
            {room.conference_series ? ` · ${room.conference_series}` : ''}
          </p>
          <p className="mt-0.5 truncate font-heading text-[15px]" style={{ color: B.navy }}>
            {room.conference_name}
          </p>
          <p className="mt-0.5 truncate text-[10.5px]" style={{ color: B.muted }}>
            {dateRangeLabel(room)}
            {placeLabel(room) ? ` · ${placeLabel(room)}` : ''}
            {room.domain_focus ? ` · ${disciplineLabel(room.domain_focus)}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <AvatarCluster items={attendees} accent={accent} size={18} max={3} />
          <span className="text-[10.5px] font-semibold" style={{ color: B.navy }}>{attendees.length}</span>
          <ChevronDown
            className="h-4 w-4 transition-transform"
            style={{ color: B.muted, transform: open ? 'rotate(180deg)' : 'none' }}
          />
        </div>
      </button>

      {open && (
        <div className="border-t px-3 py-2.5" style={{ borderColor: B.border }}>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={conferenceHref(room.id)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em]"
              style={{ background: `${B.navy}0a`, color: B.navy }}
            >
              <ExternalLink className="h-3 w-3" /> View the page
            </Link>
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em]"
              style={{ background: `${B.copper}12`, color: B.copper }}
            >
              <Pencil className="h-3 w-3" /> {editing ? 'Close editor' : 'Edit'}
            </button>
            {ended && (
              <VerifyAttendanceButton room={room} user={user} accent={accent} onChanged={() => onReload?.()} />
            )}
          </div>

          {editing && (
            <div className="mt-2.5">
              <ConferenceEditor
                room={room}
                onCancel={() => setEditing(false)}
                onSaved={(saved) => { setEditing(false); onSaved?.(saved); }}
              />
            </div>
          )}

          <div className="mt-2.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: B.muted }}>
              Rooms inside it
            </p>
            {(room.focus_areas || []).length === 0 ? (
              <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
                No rooms set. Add them in the editor — attendees organize around them, and the
                people in each one find each other.
              </p>
            ) : (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(room.focus_areas || []).map((area) => {
                  const standing = attendees.filter((person) => person.focus_area === area.label).length;
                  return (
                    <span
                      key={area.key}
                      className="rounded-full px-2 py-0.5 text-[10px]"
                      style={{ background: B.cream, border: `1px solid ${B.border}`, color: B.navy }}
                    >
                      {area.label}
                      <span className="ml-1" style={{ color: B.muted }}>{standing}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {attendees.length > 0 && (
            <div className="mt-2.5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: B.muted }}>
                Declared
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {attendees.slice(0, 12).map((person) => (
                  <li key={person.id || person.fellow_email} className="flex items-center justify-between gap-2 text-[11.5px]">
                    <span className="truncate" style={{ color: B.navy }}>{person.fellow_name || person.fellow_email}</span>
                    <span className="shrink-0 text-[10px]" style={{ color: accent }}>{person.focus_area || '—'}</span>
                  </li>
                ))}
              </ul>
              {attendees.length > 12 && (
                <p className="mt-1 text-[10px]" style={{ color: B.muted }}>
                  and {attendees.length - 12} more
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}