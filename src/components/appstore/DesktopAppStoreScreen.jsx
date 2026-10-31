import { Link } from 'react-router-dom';
import DesktopStartSky from '@/components/desktop/start/DesktopStartSky';
import DesktopStartRail from '@/components/desktop/start/DesktopStartRail';
import DesktopSurfaceIndex from '@/components/desktop/start/DesktopSurfaceIndex';

// The desk's view of the shelf: the same cover the platform opens on — the hour's sky,
// the house rail, the masthead struck in metal — with the tools listed as modules
// underneath. A reader who walks in from the title screen's key arrives somewhere that
// reads as a front, not as a settings page.
export default function DesktopAppStoreScreen({ phase, items, counts }) {
  return (
    <div
      className="relative min-h-[calc(100vh-var(--imac-top)-var(--imac-bottom))] overflow-hidden"
      style={{ background: phase.sky }}
    >
      <DesktopStartSky phase={phase} />

      <div className="relative mx-auto flex min-h-[calc(100vh-var(--imac-top)-var(--imac-bottom))] w-full max-w-[1180px] flex-col px-12 pb-32 pt-9 xl:px-16">
        <DesktopStartRail phase={phase} />

        <div className="ds-rise pt-11 lg:pt-14" style={{ animationDelay: '90ms' }}>
          <p className="flex items-center gap-4 text-[9.5px] font-bold uppercase tracking-[0.42em] text-editorial-gold">
            The App Store
            <span
              className="h-px w-14"
              style={{ background: 'linear-gradient(90deg, rgb(var(--editorial-gold-rgb) / 0.7), transparent)' }}
            />
          </p>

          <h1 className="ds-metal mt-5 font-heading text-[clamp(2.9rem,5vw,5.4rem)] leading-[0.86] tracking-[-0.02em]">
            Small instruments.
          </h1>

          <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-editorial-cream/65">
            Each tool does one job and hands you the artifact. Nothing here measures anyone,
            and nothing here can be bought.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span
              className="h-px w-20 shrink-0"
              style={{ background: 'linear-gradient(90deg, #B87333, #C9A87C)' }}
            />
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-cream/55">
              {counts.open} open
              <span className="px-2 text-editorial-gold/60">·</span>
              {counts.building} on the bench
            </p>
            <Link
              to="/"
              className="text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-gold/80 transition-colors hover:text-editorial-gold"
            >
              Title screen
            </Link>
          </div>
        </div>

        <DesktopSurfaceIndex items={items} eyebrow="On the shelf" countLabel={`${items.length} tools`} />
      </div>
    </div>
  );
}