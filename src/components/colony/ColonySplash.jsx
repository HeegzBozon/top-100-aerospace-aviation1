import { Loader2, CircleCheck } from 'lucide-react';

// Portrait plate for tall screens (phones), landscape plate for wide ones (desks).
const PORTRAIT = 'https://media.base44.com/images/public/68996845be6727838fdb822e/8965182c5_Top100Aerospace2026Campus.png';
const LANDSCAPE = 'https://media.base44.com/images/public/68996845be6727838fdb822e/1307348d0_Top100AerospaceAviation2026.png';

function Plate({ className, alt = '' }) {
  return (
    <picture>
      <source media="(orientation: landscape)" srcSet={LANDSCAPE} />
      <img src={PORTRAIT} alt={alt} className={className} />
    </picture>
  );
}

// Colony's loading screen: the whole plate is always shown (never cropped), set over a
// blurred copy of itself so any leftover space is filled with the same sky.
// `fill` sizes it to its parent frame instead of the viewport.
export default function ColonySplash({ label = 'Entering Colony…', ready = false, fill = false }) {
  return (
    <div className={`${fill ? 'absolute inset-0' : 'relative min-h-screen'} overflow-hidden bg-slate-950`}>
      <Plate className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
      <Plate alt="TOP 100 Aerospace & Aviation 2026" className="absolute inset-0 h-full w-full object-contain" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-slate-950/90 to-transparent pb-8 pt-16">
        {ready
          ? <CircleCheck className="h-4 w-4 text-editorial-gold" />
          : <Loader2 className="h-4 w-4 animate-spin text-editorial-gold" />}
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-editorial-cream">{label}</p>
      </div>
    </div>
  );
}