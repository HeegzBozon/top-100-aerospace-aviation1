import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TrendingUp, Award, Users, Calendar, Rocket, FileText, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

// Curated public pages that should be featured in Trending
const TRENDING_PAGES = [
  { 
    id: 'top100women', 
    title: 'TOP 100 Women 2025', 
    subtitle: 'The definitive list of aerospace leaders',
    page: 'Top100Women2025',
    icon: Award,
    badge: 'Publication',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format',
  },
  { 
    id: 'nominations', 
    title: 'Submit a Nomination', 
    subtitle: 'Nominate outstanding leaders',
    page: 'Nominations',
    icon: Rocket,
    badge: 'Open Now',
    image: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400&auto=format',
  },
  { 
    id: 'getstarted', 
    title: 'Get Started', 
    subtitle: 'Your entry point to the ecosystem',
    page: 'GetStarted',
    icon: Flame,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format',
  },
  { 
    id: 'howwepick', 
    title: 'How We Pick', 
    subtitle: 'Our transparent scoring methodology',
    page: 'Top100OS',
    icon: FileText,
    badge: 'Framework',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format',
  },
  { 
    id: 'talent', 
    title: 'Talent Exchange', 
    subtitle: 'Connect with aerospace professionals',
    page: 'TalentExchange',
    icon: Users,
    badge: 'Services',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&auto=format',
  },
  { 
    id: 'calendar', 
    title: 'Flight Plan', 
    subtitle: 'Upcoming events & milestones',
    page: 'Calendar',
    icon: Calendar,
    badge: 'Roadmap',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format',
  },
];

export default function TrendingSection({ trendingProfiles = [], pageViews = {} }) {
  // Sort pages by view count (desc), falling back to original list order
  const sortedPages = [...TRENDING_PAGES].sort((a, b) => {
    const va = pageViews[a.page] ?? 0;
    const vb = pageViews[b.page] ?? 0;
    return vb - va;
  });

  const profileItems = trendingProfiles.slice(0, 6).map((n) => ({
    id: n.id,
    type: 'profile',
    title: n.name,
    subtitle: n.title || n.company || n.industry || '',
    image: n.avatar_url || n.photo_url || null,
    badge: n.is_on_fire ? '🔥 Hot' : null,
    link: `Nominee?id=${n.id}`,
    isOnFire: n.is_on_fire,
    viewScore: 0,
  }));

  const pageItems = sortedPages.map((p, idx) => ({
    id: p.id,
    type: 'page',
    title: p.title,
    subtitle: p.subtitle,
    image: p.image,
    // Promote badge to "Trending" if it has the most views
    badge: idx === 0 && pageViews[p.page] > 0 ? '📈 Trending' : p.badge,
    link: p.page,
    icon: p.icon,
  }));

  // Interleave profiles and pages for variety
  const mixedItems = [];
  const maxLen = Math.max(profileItems.length, pageItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (pageItems[i]) mixedItems.push(pageItems[i]);
    if (profileItems[i]) mixedItems.push(profileItems[i]);
  }

  return (
    <section className="px-3 md:px-4 py-6">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: `${brandColors.roseAccent}20` }}>
              <TrendingUp className="w-5 h-5" style={{ color: brandColors.roseAccent }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
              Trending Now
            </h2>
          </div>
        </div>

        {/* Trending Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {mixedItems.slice(0, 8).map((item) => (
            <Link
              key={item.id}
              to={createPageUrl(item.link)}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              style={{ border: `1px solid ${brandColors.navyDeep}08` }}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #1e3a5a, #2a4f7a)' }}
                    aria-hidden="true"
                  >
                    {(item.title || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')}
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Badge */}
                {item.badge && (
                  <Badge 
                    className="absolute top-2 right-2 text-[10px] font-medium"
                    style={{ 
                      background: item.badge === 'Open Now' 
                        ? `linear-gradient(135deg, ${brandColors.roseAccent}, ${brandColors.goldPrestige})`
                        : item.badge === 'New' 
                          ? brandColors.skyBlue
                          : `${brandColors.navyDeep}CC`,
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    {item.badge}
                  </Badge>
                )}

                {/* Icon for pages */}
                {item.type === 'page' && item.icon && (
                  <div 
                    className="absolute top-2 left-2 p-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.9)' }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: brandColors.navyDeep }} />
                  </div>
                )}

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 
                    className="font-semibold text-sm text-white mb-0.5 line-clamp-1"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>


      </div>
    </section>
  );
}