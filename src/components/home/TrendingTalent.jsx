import { Flame, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { BRAND_COLORS } from '@/components/core/brandConstants';

function InitialsAvatar({ name }) {
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
  return (
    <div
      className="w-full h-32 rounded mb-2 flex items-center justify-center text-2xl font-bold text-white select-none"
      style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.navyDeep || '#1e3a5a'}, #2a4f7a)` }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function TalentCard({ nominee }) {
  const hasPhoto = !!(nominee.avatar_url || nominee.photo_url);
  return (
    <a
      href={createPageUrl(`Nominee?id=${nominee.id}`)}
      aria-label={`View profile of ${nominee.name}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4a90b8] rounded-xl"
    >
      <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
        {nominee.is_on_fire && (
          <span
            className="absolute top-2 right-2 z-10 flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white"
            aria-label="On fire"
          >
            <Flame className="w-2.5 h-2.5" aria-hidden="true" /> Hot
          </span>
        )}
        {hasPhoto ? (
          <img
            loading="lazy"
            src={nominee.avatar_url || nominee.photo_url}
            alt={nominee.name}
            className="w-full h-32 object-cover rounded mb-2"
          />
        ) : (
          <InitialsAvatar name={nominee.name} />
        )}
        <p className="font-semibold text-xs text-slate-900 line-clamp-2">{nominee.name}</p>
        <p className="text-xs text-slate-500 mt-1">
          {nominee.title || nominee.company || nominee.industry || ''}
        </p>
      </Card>
    </a>
  );
}

export default function TrendingTalent({ nominees = [] }) {
  if (!nominees.length) return null;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
        <Users className="w-6 h-6" style={{ color: BRAND_COLORS.goldPrestige }} />
        Trending Aerospace Talent
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {nominees.slice(0, 12).map(nominee => (
          <TalentCard key={nominee.id} nominee={nominee} />
        ))}
      </div>
    </div>
  );
}