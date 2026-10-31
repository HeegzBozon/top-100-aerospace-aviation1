import { Link } from 'react-router-dom';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import StoreFeatureCard from '@/components/appstore/StoreFeatureCard';
import StoreToolCard from '@/components/appstore/StoreToolCard';
import { availableTools, buildingTools } from '@/components/appstore/storeCatalog';

// The shelf, written out: every tool the store carries, what job it does and the artifact
// it hands back. The title screen is the way in; this is where a tool still on the bench
// is described in full.
export default function AppStoreShelf() {
  const open = availableTools();
  const building = buildingTools();

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-14">
        <Link
          to="/app-store"
          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em]"
          style={{ color: B.muted }}
        >
          The App Store
        </Link>

        <header className="mt-5">
          <div
            className="h-px w-24"
            style={{ background: 'linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)' }}
          />
          <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: B.copper }}>
            On the shelf
          </p>
          <h1 className="mt-2 font-heading text-[2rem] leading-[1.05] md:text-5xl" style={{ color: B.navy }}>
            What each tool does.
          </h1>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed" style={{ color: B.muted }}>
            Each tool does one job and hands you the artifact. Nothing here measures anyone, and
            nothing here can be bought.
          </p>
        </header>

        <div className="mt-7 space-y-4">
          {open.map((tool) => (
            <StoreFeatureCard key={tool.key} tool={tool} />
          ))}
        </div>

        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
              On the bench
            </p>
            <p className="text-[10px]" style={{ color: B.muted }}>
              {building.length} in build
            </p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {building.map((tool) => (
              <StoreToolCard key={tool.key} tool={tool} />
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed" style={{ color: B.muted }}>
            These four are being built. They are listed so you know what is coming, and nothing
            on this shelf opens what does not exist yet.
          </p>
        </section>

        <div className="h-20" />
      </div>
    </div>
  );
}