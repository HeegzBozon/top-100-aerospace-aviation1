import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PatronHero from '@/components/patronage/PatronHero';
import PatronAudienceLedger from '@/components/patronage/PatronAudienceLedger';
import PatronBundle from '@/components/patronage/PatronBundle';
import PatronRateCard from '@/components/patronage/PatronRateCard';
import PatronInquiryForm from '@/components/patronage/PatronInquiryForm';
import usePatronMeta from '@/components/patronage/usePatronMeta';
import { P } from '@/components/patronage/patronConfig';

// The media kit: what patronage is, who it reaches, what a slot buys, what it costs, and
// one door to raise a hand. Public, and readable without an account — a buyer is not a
// Fellow, and should not have to become one to ask a question.
export default function Patronage() {
  usePatronMeta({
    title: 'Become a Patron of Record | TOP 100 Aerospace & Aviation',
    description:
      'Patronage in the TOP 100 Aerospace & Aviation publication: one issue slot, a native post, a Volume credit and two written reports. Attribution, never placement.',
  });

  // The desk is not advertised to buyers. It is only a door for the people who work it.
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth
      .me()
      .then((user) => setIsAdmin(user?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: P.cream }}>
      <PatronHero />
      <PatronAudienceLedger />
      <PatronBundle />
      <PatronRateCard />
      <PatronInquiryForm />

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