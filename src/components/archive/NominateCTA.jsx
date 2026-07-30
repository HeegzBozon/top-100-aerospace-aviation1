import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const navy = '#1e3a5a';
const gold = '#c9a87c';

export default function NominateCTA({ variant = 'inline' }) {
  const isBanner = variant === 'banner';

  if (isBanner) {
    return (
      <section className="border-t px-4 sm:px-6 py-12 sm:py-20" style={{ borderColor: `${navy}12`, background: navy }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: gold }}>
            The Current Season is Open
          </p>
          <h2 className="text-2xl sm:text-4xl font-semibold mb-4"
            style={{ color: '#faf8f5', fontFamily: 'Playfair Display, Georgia, serif' }}>
            Know someone who belongs on the next list?
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base mb-6" style={{ color: 'rgba(250,248,245,0.75)' }}>
            Nominations for the current TOP 100 Aerospace &amp; Aviation season are open now.
            Add a name, a reason, and your connection — the graph grows with you.
          </p>
          <Link
            to="/nominate"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-all hover:gap-3"
            style={{ background: gold, color: navy }}
          >
            Submit a Nomination
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <Link
      to="/nominate"
      className="group block border transition-all hover:-translate-y-0.5"
      style={{ borderColor: `${gold}45`, background: `${gold}0F` }}
    >
      <div className="p-5 sm:p-6 flex items-start gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: gold }}>
            The Current Season is Open
          </p>
          <p className="text-base sm:text-lg font-medium leading-snug"
            style={{ color: navy, fontFamily: 'Playfair Display, Georgia, serif' }}>
            Know someone who belongs on the next list?
          </p>
          <p className="mt-1.5 text-[12px]" style={{ color: `${navy}80` }}>
            Submit a nomination for the current season →
          </p>
        </div>
        <ArrowRight className="w-5 h-5 mt-1 shrink-0 opacity-50 group-hover:opacity-100" style={{ color: navy }} />
      </div>
    </Link>
  );
}