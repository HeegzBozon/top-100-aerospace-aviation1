import { Loader2, CircleCheck } from 'lucide-react';

// Portrait plate for tall screens (phones), landscape plate for wide ones (desks).
const PORTRAIT = 'https://media.base44.com/images/public/68996845be6727838fdb822e/a17b0bcca_CosmicAerospaceTop100Campus.png';
const LANDSCAPE = 'https://media.base44.com/images/public/68996845be6727838fdb822e/a11312eb5_Top100AerospaceAviationUniverse.png';

// Colony's loading screen: the adventure plate, with the connection status at its foot.
// While connecting the mark spins; once ready it settles into a lit check.
export default function ColonySplash({ label = 'Entering Colony…', ready = false }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <picture>
        <source media="(orientation: landscape)" srcSet={LANDSCAPE} />
        <img src={PORTRAIT} alt="TOP 100 Aerospace & Aviation Universe" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-slate-950/90 to-transparent pb-8 pt-16">
        {ready
          ? <CircleCheck className="h-4 w-4 text-editorial-gold" />
          : <Loader2 className="h-4 w-4 animate-spin text-editorial-gold" />}
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-editorial-cream">{label}</p>
      </div>
    </div>
  );
}