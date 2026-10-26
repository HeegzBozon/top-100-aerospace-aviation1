import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { disciplineLabel } from '@/components/conference-room/conferenceRoomConfig';

const initial = (name) => (name ? String(name).trim()[0].toUpperCase() : '?');

// The Fellow's own record, at the head of the check-in column: who they are as
// the platform currently holds it, and the two ways into it. Read-only here —
// the profile surface is where the record is written.
export default function ProfileStrip({ profile }) {
  if (!profile) return null;

  const { name, avatarUrl, role, org, discipline, story, verified, verifiedLabel, claimed, profileId } = profile;
  const credential = [role, org].filter(Boolean).join(' · ');

  return (
    <section className="rounded-[10px] p-3" style={{ background: '#FFFFFF', border: '1px solid rgba(30,58,90,0.12)' }}>
      <span className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
        Your record
      </span>

      <div className="mt-2 flex items-center gap-2.5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{ background: B.sand, color: B.navy }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[13px] font-bold">{initial(name)}</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-bold" style={{ color: B.navy }}>
            {name || 'Your name, as the record will read'}
          </span>
          <span className="block truncate text-[10px]" style={{ color: B.muted }}>
            {credential || (discipline ? disciplineLabel(discipline) : 'No credential on the record yet')}
          </span>
        </span>
      </div>

      {story ? (
        <p className="mt-2 font-heading text-[12px] italic leading-snug" style={{ color: 'rgba(30,58,90,0.75)' }}>
          “{story}”
        </p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center rounded-full px-2 py-[3px] text-[7.5px] font-bold uppercase tracking-[0.16em]"
          style={
            verified
              ? { background: 'rgba(201,168,124,0.2)', border: '1px solid rgba(184,115,51,0.3)', color: B.copper }
              : { background: 'rgba(30,58,90,0.06)', border: '1px solid rgba(30,58,90,0.16)', color: 'rgba(30,58,90,0.6)' }
          }
        >
          {verifiedLabel}
        </span>
        {claimed ? (
          <span
            className="inline-flex items-center rounded-full px-2 py-[3px] text-[7.5px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(30,58,90,0.06)', border: '1px solid rgba(30,58,90,0.16)', color: B.navy }}
          >
            Claimed
          </span>
        ) : null}
        {discipline ? (
          <span
            className="inline-flex items-center rounded-full px-2 py-[3px] text-[7.5px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(30,58,90,0.06)', border: '1px solid rgba(30,58,90,0.16)', color: B.navy }}
          >
            {disciplineLabel(discipline)}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-2.5" style={{ borderColor: 'rgba(30,58,90,0.10)' }}>
        <Link
          to="/Profile"
          className="group inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.18em]"
          style={{ color: B.copper }}
        >
          Open your record
          <ArrowRight className="h-[10px] w-[10px] transition-transform group-hover:translate-x-0.5" />
        </Link>
        {profileId ? (
          <Link
            to={`/profiles/${profileId}`}
            className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.18em]"
            style={{ color: 'rgba(30,58,90,0.6)' }}
          >
            How it reads publicly
          </Link>
        ) : null}
      </div>
    </section>
  );
}