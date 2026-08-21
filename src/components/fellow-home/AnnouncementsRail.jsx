import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Vote, Sparkles } from 'lucide-react';
import RailBlock from '@/components/fellow-home/RailBlock';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Curated institutional announcements — season-relevant, never free text.
const ITEMS = [
  { id: 'noms', label: 'Nominations close Sept 1', detail: 'Final days to enter', icon: CalendarDays, to: '/nominate' },
  { id: 'vote', label: 'Season 4 voting opens', detail: 'September 15', icon: Vote, to: '/nominate' },
  { id: 'reveal', label: 'Aura reveal', detail: 'Following cycle close', icon: Sparkles, to: '/top100-tv' },
];

export default function AnnouncementsRail({ accent }) {
  return (
    <RailBlock title="Announcements" accent={accent}>
      <div className="space-y-2.5">
        {ITEMS.map((a) => (
          <Link key={a.id} to={a.to} className="block group">
            <div className="flex items-start gap-2.5">
              <a.icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold leading-snug" style={{ color: B.navy }}>{a.label}</p>
                <p className="text-[11px] leading-snug" style={{ color: B.muted }}>{a.detail}</p>
              </div>
              <ArrowRight className="w-3 h-3 mt-1 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: B.muted }} />
            </div>
          </Link>
        ))}
      </div>
    </RailBlock>
  );
}