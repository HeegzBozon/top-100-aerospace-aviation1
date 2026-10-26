import { ArrowRight, BadgeCheck, Handshake, IdCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// What to have in place before you stand in a room. Three states read from the
// record itself — nothing to maintain here, and nothing that touches
// measurement.
export default function BeforeYouGo({ nominee, availability = 0, pendingIntros = 0, user }) {
  const recordHeld = Boolean(
    user && nominee && (nominee.professional_role || nominee.title) && (nominee.description || nominee.bio),
  );

  const cues = [
    {
      key: 'record',
      icon: IdCard,
      label: 'Your record',
      state: recordHeld
        ? 'Readable. An introducer can place you in one line.'
        : 'Thin. A role and a line about the work is what an introducer reads.',
      to: '/Profile',
      action: 'Open your record',
    },
    {
      key: 'availability',
      icon: Handshake,
      label: 'Your availability',
      state: availability > 0
        ? `${plural(availability, 'introduction')} open on the board.`
        : 'Not on the availability board yet. Declare what you are available for.',
      to: '/Profile?board=intros',
      action: 'Set availability',
    },
    {
      key: 'intros',
      icon: BadgeCheck,
      label: 'Introductions',
      state: pendingIntros > 0
        ? `${plural(pendingIntros, 'request')} waiting on you.`
        : 'Nothing waiting on you.',
      to: '/Profile?board=intros',
      action: 'Review introductions',
    },
  ];

  return (
    <section className="mt-8">
      <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
        Before you go
      </p>
      <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
        The room is the easy part. These three are what make the introductions land.
      </p>

      <div className="mt-4 grid gap-2.5 md:grid-cols-3">
        {cues.map((cue) => {
          const Icon = cue.icon;
          return (
            <Link
              key={cue.key}
              to={cue.to}
              className="group flex flex-col rounded-2xl p-3.5 transition-shadow hover:shadow-md"
              style={{ background: '#FFFFFF', border: B.border }}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" style={{ color: B.copper }} />
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: B.navy }}
                >
                  {cue.label}
                </span>
              </span>
              <span className="mt-1.5 flex-1 text-[11.5px] leading-snug" style={{ color: B.muted }}>
                {cue.state}
              </span>
              <span
                className="mt-2.5 inline-flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.18em]"
                style={{ color: B.copper }}
              >
                {cue.action}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}