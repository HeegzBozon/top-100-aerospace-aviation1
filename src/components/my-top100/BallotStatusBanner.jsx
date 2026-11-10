import { AlertTriangle } from 'lucide-react';

// A note under the Manifest's name, and only when there is something to say.
//
// It reports a save the list refused — one line, struck with the copper rule, because the
// list is the subject of this surface and everything here supports it. The time left in the
// cycle belongs to the masthead above, and saving and sharing are read there too, so
// nothing is printed on this line while the list is saving cleanly.
export default function BallotStatusBanner({ errorMessage }) {
  if (!errorMessage) return null;

  return (
    <div className="mb-4 border border-editorial-copper/30 bg-editorial-sand/25 px-4 py-2">
      <p className="flex items-start gap-1.5 border-l-2 border-editorial-copper pl-2 font-body text-[10.5px] leading-relaxed text-editorial-navy/75">
        <AlertTriangle className="mt-[2px] h-3 w-3 shrink-0 text-editorial-copper" aria-hidden="true" />
        {errorMessage}
      </p>
    </div>
  );
}