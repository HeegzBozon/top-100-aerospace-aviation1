import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Shield, CalendarCheck, Users, ShoppingBag, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAV_LINKS = [
  { label: 'Operation: Moon Joy', to: '/moon-joy' },
  { label: 'Nominate', to: '/nominate' },
  { label: 'Calendar', to: '/events' },
  { label: 'Shop', to: '/Shop' },
  { label: 'Local Legends', to: '/local-legends' },
  { label: 'Publication', to: '/Top100Women2025' },
  { label: '2030 Vision', to: '/2030-vision' },
  { label: 'About', to: '/about' },
  { label: 'Community Round', href: 'https://wefunder.com/top.100.aerospace.aviation' },
  { label: 'Mission Theatre', to: '/LaunchParty' },
];

const RSVP_URL = 'https://calendar.app.google/TrL8saY6XS6tdVj1A';

// Single sticky bottom dock that consolidates the old top-center nav, the
// top-right menu toggle, and the floating RSVP button into one glass bar.
export default function HomeDock() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then((u) => setIsAdmin(u?.role === 'admin'))
      .catch(() => {});
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 px-4">
      {/* Menu flyout — opens upward from the dock's left edge */}
      {menuOpen && (
        <div
          className="absolute bottom-16 left-2 max-h-[70vh] w-64 overflow-y-auto rounded-2xl shadow-2xl"
          style={{ background: 'rgba(7,17,31,0.97)', border: '1px solid rgba(201,168,124,0.2)', backdropFilter: 'blur(20px)' }}
        >
          {NAV_LINKS.map(({ label, to, href }) =>
            href ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="block border-b border-white/5 px-5 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/5 hover:text-[#c9a87c] last:border-0"
              >
                {label} ↗
              </a>
            ) : (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-white/5 px-5 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/5 hover:text-[#c9a87c] last:border-0"
              >
                {label}
              </Link>
            ),
          )}
          {isAdmin && (
            <Link
              to="/Admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 border-t border-[#c9a87c]/20 px-5 py-3.5 text-sm font-semibold text-[#c9a87c] transition-all hover:bg-white/5"
            >
              <Shield className="h-4 w-4" /> Admin Portal
            </Link>
          )}
        </div>
      )}

      {/* Dock pill */}
      <div
        className="flex items-center gap-1 rounded-full px-2 py-2 shadow-2xl"
        style={{ background: 'rgba(7,17,31,0.9)', border: '1px solid rgba(201,168,124,0.28)', backdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[#c9a87c] transition-all hover:bg-white/10"
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Divider />

        <DockLink to="/nominate" icon={Users} label="Nominate" />

        <a
          href={RSVP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center gap-1.5 rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#07111f] transition-all hover:brightness-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #c9a87c, #e0c79a)' }}
        >
          <CalendarCheck className="h-4 w-4" />
          <span>RSVP</span>
        </a>

        <DockLink to="/subscribe" icon={Mail} label="Subscribe" />

        <DockLink to="/Shop" icon={ShoppingBag} label="Shop" />
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-6 w-px bg-white/15" />;
}

function DockLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition-all hover:bg-white/10 hover:text-[#c9a87c]"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}