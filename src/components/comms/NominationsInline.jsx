import { useState, useEffect } from 'react';
import { Trophy, Award, LogIn, UserPlus, ClipboardList, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import NominationHistoryFeed from '@/components/nominations/NominationHistoryFeed';
import InlineNominationForm from '@/components/nominations/InlineNominationForm';
import { base44 } from '@/api/base44Client';

const brand = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  gold: '#c9a87c',
  cream: '#faf8f5',
};

const TABS = [
  { id: 'nominate', label: 'Nominate',       icon: PlusCircle },
  { id: 'history',  label: 'My Nominations', icon: ClipboardList },
];

function MobileTabBar({ activeTab, setActiveTab }) {
  return (
    <div
      className="flex md:hidden shrink-0 border-b bg-white"
      role="tablist"
      aria-label="Nominations sections"
      style={{ borderColor: `${brand.navyDeep}12` }}
    >
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors"
            style={{ color: active ? brand.navyDeep : `${brand.navyDeep}45` }}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {tab.label}
            {active && (
              <motion.div
                layoutId="mobile-nom-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: brand.gold }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function AuthGate() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 text-center">
      <Trophy className="w-14 h-14 mb-5" style={{ color: brand.gold }} aria-hidden="true" />
      <h2
        className="text-xl font-bold mb-3 leading-tight"
        style={{ color: brand.navyDeep, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Every Nomination Matters
      </h2>
      <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: `${brand.navyDeep}70` }}>
        Nominations are tied to a real account — that's our anti-gaming mechanism. Sign in, back someone worthy, and let the record show you called it.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ background: brand.navyDeep, minHeight: 48 }}
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          Sign In
        </button>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background: `${brand.gold}18`,
            color: brand.gold,
            border: `1.5px solid ${brand.gold}40`,
            minHeight: 48,
          }}
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          Create Account
        </button>
      </div>
    </div>
  );
}

function HeroHeader() {
  return (
    <div
      className="shrink-0 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${brand.navyDeep} 0%, #0d2137 100%)` }}
    >
      <div className="relative px-5 py-2 md:py-8">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-3 h-3" style={{ color: brand.gold }} aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: brand.gold }}>
            Season 4 Now Open
          </span>
        </div>
        <h1
          className="text-sm md:text-3xl font-bold text-white leading-tight mb-0"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Nominate{' '}
          <span
            style={{
              background: `linear-gradient(90deg, ${brand.gold}, ${brand.skyBlue})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <span className="md:hidden">Aerospace Leaders</span>
            <span className="hidden md:inline">the Next Aerospace Leaders</span>
          </span>
        </h1>
        <p className="text-white/65 text-[11px] md:text-sm max-w-lg hidden md:block">
          Know someone shaping the future of flight? Put their name forward.
        </p>

        {/* Stats — desktop only */}
        <div className="hidden md:flex gap-3 mt-4">
          {[['500+', 'Nominees'], ['45+', 'Countries']].map(([val, label]) => (
            <div
              key={label}
              className="px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="text-lg font-bold text-white">{val}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NominationsInline() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState('nominate');

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: brand.cream }}>
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  const showNominateForm = mobileTab === 'nominate';
  const showHistory      = mobileTab === 'history';

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: brand.cream }}>
      <HeroHeader />

      {/* Mobile tab bar — only when authenticated (guests see only the auth gate) */}
      {user && <MobileTabBar activeTab={mobileTab} setActiveTab={setMobileTab} />}

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">

        {/*
          Form column:
          - md+: always visible, 45% width, left border
          - mobile: full width, only shown when mobileTab === 'nominate' (or guest)
        */}
        <div
          className={`
            flex flex-col overflow-y-auto bg-white
            md:flex md:w-[45%] md:border-r md:overflow-hidden
            ${!user || showNominateForm ? 'flex w-full' : 'hidden'}
          `}
          style={{ borderColor: `${brand.navyDeep}10` }}
        >
          {user ? <InlineNominationForm /> : <AuthGate />}
          {/* Dock clearance spacer — mobile only. Dock is fixed bottom-6 + h-16 = 88px */}
          <div className="md:hidden shrink-0" style={{ height: 100 }} aria-hidden="true" />
        </div>

        {/*
          History column:
          - md+: always visible, 55% width
          - mobile: full width, only shown when mobileTab === 'history'
        */}
        <div
          className={`
            flex-col overflow-y-auto
            md:flex md:w-[55%]
            ${user && showHistory ? 'flex w-full' : 'hidden'}
          `}
          style={{ background: brand.cream }}
        >
          {/* Sticky section header — desktop only */}
          <div
            className="hidden md:block sticky top-0 z-10 px-4 py-3 border-b"
            style={{ background: brand.cream, borderColor: `${brand.navyDeep}10` }}
          >
            <h2 className="font-semibold" style={{ color: brand.navyDeep }}>Recent Nominations</h2>
            <p className="text-xs mt-0.5" style={{ color: `${brand.navyDeep}55` }}>
              {user ? "Track nominations you've submitted and received" : 'See recent community nominations'}
            </p>
          </div>
          <NominationHistoryFeed />
        </div>
      </div>
    </div>
  );
}