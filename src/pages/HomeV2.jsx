import HomeHeroSlider from '@/components/home-v2/HomeHeroSlider';
import LeadConnectorChatWidget from '@/components/home-v2/LeadConnectorChatWidget';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Hangouts', to: '/hangouts' },
  { label: 'Nominate', to: '/nominate' },
  { label: 'Local Legends', to: '/local-legends' },
  { label: 'Publication', to: '/Top100Women2025' },
  { label: 'Community Round', href: 'https://wefunder.com/top.100.aerospace.aviation' },
  { label: 'Mission Theatre', to: '/LaunchParty' },
];

export default function HomeV2() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Menu toggle — fixed top-right */}
      <div className="fixed top-4 right-4 z-[100]">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="flex items-center justify-center w-11 h-11 rounded-full transition-all"
          style={{ background: 'rgba(7,17,31,0.85)', border: '1px solid rgba(201,168,124,0.35)', backdropFilter: 'blur(12px)' }}
          aria-label="Menu"
        >
          {menuOpen
            ? <X className="w-5 h-5 text-[#c9a87c]" />
            : <Menu className="w-5 h-5 text-[#c9a87c]" />
          }
        </button>

        {menuOpen && (
          <div
            className="absolute top-14 right-0 w-56 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(7,17,31,0.97)', border: '1px solid rgba(201,168,124,0.2)', backdropFilter: 'blur(20px)' }}
          >
            {NAV_LINKS.map(({ label, to, href }) => (
              href ? (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3.5 text-sm font-semibold text-white/80 hover:text-[#c9a87c] hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
                >
                  {label} ↗
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3.5 text-sm font-semibold text-white/80 hover:text-[#c9a87c] hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
                >
                  {label}
                </Link>
              )
            ))}
          </div>
        )}
      </div>

      <HomeHeroSlider />
      <LeadConnectorChatWidget />
    </>
  );
}