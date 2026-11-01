import { Link } from 'react-router-dom';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import StoreToolCard from '@/components/appstore/StoreToolCard';
import { RECRUITER_TOOLS } from '@/components/appstore/storeCatalog';

// The Recruiter: one micro app in the store, housing its four micro services.
export default function AppStoreRecruiter() {
  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-14">
        <Link to="/app-store" className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: B.muted }}>
          The App Store
        </Link>
        <header className="mt-5">
          <div className="h-px w-24" style={{ background: 'linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)' }} />
          <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: B.copper }}>Micro app</p>
          <h1 className="mt-2 font-heading text-[2rem] leading-[1.05] md:text-5xl" style={{ color: B.navy }}>Recruiter</h1>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed" style={{ color: B.muted }}>
            Four micro services for careers and teams. Each does one job on your own record and hands back a one-page brief.
          </p>
        </header>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {RECRUITER_TOOLS.map((tool) => <StoreToolCard key={tool.key} tool={tool} />)}
        </div>
      </div>
    </div>
  );
}