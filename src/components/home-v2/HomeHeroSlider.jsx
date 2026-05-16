import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Globe2, MapPin, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NominationCountdown from '@/components/home-v2/NominationCountdown';

function useIsLiveNow() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const check = () => {
      const pt = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      const day = pt.getDay();
      const totalMin = pt.getHours() * 60 + pt.getMinutes();
      setLive(day >= 1 && day <= 5 && totalMin >= 810 && totalMin < 900);
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);
  return live;
}

const slides = [
  {
    id: 'think-global',
    eyebrow: 'Season 4 — 2026',
    title: 'Think Global',
    kicker: 'One aerospace community across borders, disciplines, and generations.',
    body: 'TOP 100 connects talent, alumni, investors, operators, scientists, and industry leaders shaping the next chapter of flight.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2400&auto=format&fit=crop&q=90',
    icon: Globe2,
    primary: { label: 'Nominate Now', to: '/nominate' },
    secondary: { label: 'View Publication', to: '/Top100Women2025' },
  },
  {
    id: 'act-local',
    eyebrow: 'Local Legends',
    title: 'Act Local',
    kicker: 'Every aerospace hub is powered by the places that keep people going.',
    body: 'Discover and nominate the local businesses, trusted services, and community anchors supporting aerospace professionals city by city.',
    image: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b4c3?w=2400&auto=format&fit=crop&q=90',
    icon: MapPin,
    primary: { label: 'Nominate a Local Legend', to: '/nominate' },
    secondary: { label: 'Explore Local Legends', to: '/local-legends' },
  },
  {
    id: 'ad-astra',
    eyebrow: 'Mission Theatre • Fundraising Journey',
    title: 'Ad Astra',
    kicker: 'Part live mission theatre. Part transparent fundraising journey.',
    body: 'Follow the launches, signal reports, community milestones, and capital campaign behind the next layer of aerospace and aviation infrastructure.',
    image: 'https://images.unsplash.com/photo-1517976547714-720226b864c1?w=2400&auto=format&fit=crop&q=90',
    icon: Rocket,
    primary: { label: 'Enter Mission Theatre', to: '/LaunchParty' },
    secondary: { label: 'Follow Our Fundraising Journey', href: 'https://wefunder.com/top.100.aerospace.aviation' },
  },
];

function SlideButton({ action, variant = 'primary' }) {
  const className = variant === 'primary'
    ? 'rounded-full px-7 py-6 text-sm font-bold text-[#0a1526] shadow-[0_0_32px_rgba(201,168,124,0.35)] hover:shadow-[0_0_42px_rgba(201,168,124,0.55)]'
    : 'rounded-full border-white/25 bg-white/10 px-7 py-6 text-sm font-bold text-white backdrop-blur-md hover:bg-white/15';

  const button = (
    <Button variant={variant === 'primary' ? 'default' : 'outline'} className={className} style={variant === 'primary' ? { background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' } : undefined}>
      {action.label}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );

  if (action.href) {
    return <a href={action.href} target="_blank" rel="noopener noreferrer">{button}</a>;
  }

  return <Link to={action.to}>{button}</Link>;
}

export default function HomeHeroSlider() {
  const [active, setActive] = useState(0);
  const isLive = useIsLiveNow();
  const slide = slides[active];
  const Icon = slide.icon;

  const starPositions = useMemo(() => Array.from({ length: 22 }, (_, index) => ({
    id: index,
    top: `${8 + ((index * 17) % 84)}%`,
    left: `${5 + ((index * 29) % 90)}%`,
    delay: `${(index % 7) * 0.35}s`,
    size: index % 4 === 0 ? 'h-1.5 w-1.5' : 'h-1 w-1',
  })), []);

  useEffect(() => {
    const timer = setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => setActive((index + slides.length) % slides.length);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <AnimatePresence mode="wait">
        <motion.img
          key={slide.id}
          src={slide.image}
          alt=""
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.62, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#10243a]/88 to-[#07111f]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-transparent to-[#07111f]/45" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(201,168,124,0.28),transparent_30%),radial-gradient(circle_at_82%_70%,rgba(74,144,184,0.18),transparent_28%)]" />

      <div className="absolute inset-0 pointer-events-none">
        {starPositions.map((star) => (
          <span
            key={star.id}
            className={`absolute rounded-full bg-white/80 ${star.size} animate-pulse`}
            style={{ top: star.top, left: star.left, animationDelay: star.delay }}
          />
        ))}
      </div>

      <section className="relative z-10 flex min-h-screen items-center px-5 py-10 md:px-12 lg:px-20">
        <div className="mx-auto grid w-full max-w-7xl items-end gap-10 lg:grid-cols-[1fr_360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="max-w-4xl"
            >
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#c9a87c]/35 bg-[#c9a87c]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c] backdrop-blur-md">
                <Icon className="h-4 w-4" />
                {slide.eyebrow}
              </div>

              <h1 className="text-6xl font-bold leading-[0.92] tracking-tight md:text-8xl lg:text-9xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {slide.title.split(' ').map((word, index) => (
                  <span key={word} className={index === 1 ? 'block text-[#c9a87c]' : 'block'}>{word}</span>
                ))}
              </h1>

              <p className="mt-7 max-w-2xl text-xl font-semibold leading-relaxed text-white md:text-2xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {slide.kicker}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                {slide.body}
              </p>

              {slide.id === 'think-global' && <NominationCountdown />}

              {slide.id === 'think-global' && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    to="/hangouts"
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(201,168,124,0.4)]"
                    style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.25), rgba(201,168,124,0.12))', border: '1px solid rgba(201,168,124,0.55)', color: '#c9a87c' }}
                  >
                    {isLive ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                        <span className="text-red-300">LIVE NOW</span>
                        <span className="text-white/40">·</span>
                        Join Hangouts
                        <ArrowRight className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c]" />
                        Join Hangouts · M–F 1:30 PM Pacific · Free
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </Link>
                </div>
              )}

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <SlideButton action={slide.primary} />
                <SlideButton action={slide.secondary} variant="secondary" />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c9a87c]">Mission Slider</p>
              <p className="text-sm text-white/60">0{active + 1} / 03</p>
            </div>

            <div className="space-y-3">
              {slides.map((item, index) => {
                const ItemIcon = item.icon;
                const selected = index === active;
                return (
                  <button
                    key={item.id}
                    onClick={() => goTo(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${selected ? 'border-[#c9a87c]/55 bg-[#c9a87c]/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected ? 'bg-[#c9a87c] text-[#07111f]' : 'bg-white/10 text-[#c9a87c]'}`}>
                        <ItemIcon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="text-xs text-white/50">{item.eyebrow}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="outline" size="icon" onClick={() => goTo(active - 1)} className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => goTo(active + 1)} className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}