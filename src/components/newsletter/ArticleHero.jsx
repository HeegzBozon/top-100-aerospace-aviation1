import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArticleHero({ eyebrow, title, subtitle }) {
  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517976547714-720226b864c1?q=80&w=3000&auto=format&fit=crop"
          alt="Aerospace horizon"
          className="h-full w-full object-cover opacity-45 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/70 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,168,124,0.22),transparent_28%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center md:px-12">
        <Link to="/" className="mb-8 inline-block">
          <Button variant="outline" className="rounded-full border-slate-700 bg-slate-900/50 text-slate-300 backdrop-blur-md hover:bg-slate-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <div className="mb-6 inline-flex items-center rounded-full border border-[#c9a87c]/30 bg-[#c9a87c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-[#c9a87c] backdrop-blur-sm">
          <Calendar className="mr-2 h-3.5 w-3.5" /> {eyebrow}
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {title}
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {subtitle}
        </p>

        <div className="mt-10 flex items-center gap-3 text-[#c9a87c]">
          <Rocket className="h-4 w-4" />
          <div className="h-px w-28 bg-gradient-to-r from-transparent via-[#c9a87c] to-transparent" />
          <Rocket className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
}