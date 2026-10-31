import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { hourPhase } from '@/components/core/appOpening';
import StartSky from '@/components/start/StartSky';
import JobBoardView from '@/components/chamber-jobs/JobBoardView';
import MemberIntrosView from '@/components/chamber-intros/MemberIntrosView';
import IntroRequestsDesk from '@/components/chamber-intros/IntroRequestsDesk';
import CareerResourceCenterView from '@/components/career-resources/CareerResourceCenterView';
import DomainNetworksView from '@/components/domain-networks/DomainNetworksView';
import RibbonCuttingsView from '@/components/ribbon-cuttings/RibbonCuttingsView';
import { CHAMBER_DESKS, chamberDesk } from '@/components/chamber/chamberOffices';

// A Chamber desk. The five surfaces the house works from were already built against their
// canonical entity, but the only door to them was a Fellow's own bulletin board — so the
// Chamber had offices it could not walk into. This is that door: the desk's name in the
// house's hand at the head of the glass, and the surface itself seated on cream below it,
// exactly as it was written.
//
// Introductions is the one desk with two halves: what members make themselves available
// for, and the requests sitting in the reader's own desk.
const VIEWS = {
  opportunities: JobBoardView,
  career: CareerResourceCenterView,
  networks: DomainNetworksView,
  milestones: RibbonCuttingsView,
};

export default function ChamberOffice() {
  const { office } = useParams();
  const desk = useMemo(() => chamberDesk(office), [office]);
  const [phase] = useState(() => hourPhase());
  const [user, setUser] = useState(null);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.auth
      .me()
      .then((me) => { if (alive) setUser(me); })
      .catch(() => { if (alive) setUser(null); })
      .finally(() => { if (alive) setUserChecked(true); });
    return () => { alive = false; };
  }, []);

  const View = desk ? VIEWS[desk.key] : null;

  return (
    <div className="hh-scroll-window relative flex min-h-screen flex-col">
      <div className="hh-scroll-plane relative flex min-h-full flex-1 flex-col" style={{ background: phase.sky }}>
        <StartSky phase={phase} />

        <div className="hh-scroll-page relative flex flex-1 flex-col">
          <div className="shrink-0 px-5 pb-4 pt-5 md:mx-auto md:w-full md:max-w-3xl md:px-12 md:pb-8 md:pt-12">
            <Link
              to="/chamber"
              className="inline-flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.28em] text-editorial-cream/55 transition-colors hover:text-editorial-gold md:text-[10px]"
            >
              &larr; Chamber of Commerce
            </Link>
            <div className="mt-3">
              <div
                className="h-px w-20 md:w-40"
                style={{ background: 'linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)' }}
              />
              <h1 className="mt-2.5 font-heading text-[1.75rem] leading-[0.98] tracking-[-0.01em] text-editorial-cream md:text-5xl">
                {desk ? desk.label : 'Desk not found'}
              </h1>
              <p className="mt-1.5 max-w-xl text-[10.5px] leading-relaxed text-editorial-cream/65 md:mt-2 md:text-[13px]">
                {desk ? desk.blurb : 'That desk is not one of the house’s. The list of them is on the Chamber floor.'}
              </p>
            </div>
          </div>

          <div className="flex-1 bg-editorial-cream px-5 pb-10 pt-5 md:px-12 md:pb-16 md:pt-9">
            <div className="mx-auto w-full md:max-w-3xl">
              {!desk ? (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                  <AlertCircle className="h-6 w-6 text-editorial-navy/45" />
                  <p className="text-sm font-bold text-editorial-navy">This desk does not exist.</p>
                  <Link to="/chamber" className="text-xs font-semibold text-editorial-copper">
                    Back to the Chamber floor
                  </Link>
                </div>
              ) : desk.key === 'introductions' ? (
                <>
                  <MemberIntrosView user={user} accent="#1E3A5A" />
                  {userChecked ? <IntroRequestsDesk user={user} accent="#1E3A5A" /> : null}
                </>
              ) : View ? (
                <View user={user} accent="#1E3A5A" />
              ) : null}

              {desk ? (
                <nav className="mt-10 border-t border-editorial-navy/10 pt-4">
                  <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.26em] text-editorial-label">
                    Other desks
                  </p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {CHAMBER_DESKS.filter((other) => other.key !== desk.key).map((other) => (
                      <li key={other.key}>
                        <Link
                          to={other.to}
                          className="text-[11.5px] font-semibold text-editorial-navy/70 transition-colors hover:text-editorial-copper"
                        >
                          {other.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}