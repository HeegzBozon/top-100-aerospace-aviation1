import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import LazyLoadWrapper from '@/components/capabilities/performance/LazyLoadWrapper';
import PatronHero from '@/components/patronage/PatronHero';
const PatronDeck = lazy(() => import('@/components/patronage/deck/PatronDeck'));
import PatronAudienceLedger from '@/components/patronage/PatronAudienceLedger';
import PatronBundle from '@/components/patronage/PatronBundle';
import PatronRateCard from '@/components/patronage/PatronRateCard';
const PatronInquiryForm = lazy(() => import('@/components/patronage/PatronInquiryForm'));
import usePatronMeta from '@/components/patronage/usePatronMeta';
import { SHARE_TITLE, SHARE_DESCRIPTION } from '@/components/patronage/patronShareCard';
import { P } from '@/components/patronage/patronConfig';

// The media kit: what patronage is, who it reaches, what a slot buys, what it costs, and
// one door to raise a hand. Public, and readable without an account — a buyer is not a
// Fellow, and should not have to become one to ask a question.
export default function Patronage() {
  // The share card a buyer sees in a feed is the offer itself, held in one place.
  usePatronMeta({ title: SHARE_TITLE, description: SHARE_DESCRIPTION });

  // The desk is not advertised to buyers. It is only a door for the people who work it.
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen" style={{ background: P.cream }}>
      <PatronHero />
      {/* The kit opens as a deck: the argument in six slides, before the detail below it */}
      <LazyLoadWrapper height={420} rootMargin="200px" fallback={<div className="h-[420px] bg-editorial-navy" aria-label="Loading media kit slides" />}>
        <Suspense fallback={<div className="h-[420px] bg-editorial-navy" role="status" aria-label="Loading media kit slides" />}>
          <PatronDeck />
        </Suspense>
      </LazyLoadWrapper>
      <PatronAudienceLedger />
      <PatronBundle />
      <PatronRateCard />
      <section id="enquire">
        <LazyLoadWrapper height={640} rootMargin="400px" fallback={<p className="p-8 text-editorial-navy" role="status">Loading enquiry form…</p>}>
          <Suspense fallback={<p className="p-8 text-editorial-navy" role="status">Loading enquiry form…</p>}>
            <PatronInquiryForm sectionId={null} />
          </Suspense>
        </LazyLoadWrapper>
      </section>

      <footer className="border-t" style={{ borderColor: P.hair }}>
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-7 md:px-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: P.faint }}>
            TOP 100 Aerospace &amp; Aviation &middot; The publication
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-[0.18em]">
            <Link to="/newsstand" style={{ color: P.copper }}>
              The newsstand
            </Link>
            <Link to="/chamber" style={{ color: P.copper }}>
              The Chamber
            </Link>
            <a href="/media-kit/TOP100-Patronage-Media-Kit.md" download style={{ color: P.copper }}>
              Media kit (.md)
            </a>
            <Link to="/terms" style={{ color: P.copper }}>
              Terms
            </Link>
            {isAdmin ? (
              <Link to="/patronage/desk" style={{ color: P.copper }}>
                The desk
              </Link>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}