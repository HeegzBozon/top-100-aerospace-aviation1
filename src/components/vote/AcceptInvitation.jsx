import { ArrowRight } from 'lucide-react';

// The one press the invitation asks for. Shown under the letter and again at its foot.
export default function AcceptInvitation({ onAccept, className = '' }) {
  return (
    <div className={className}>
      <button
        type="button"
        onClick={onAccept}
        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-editorial-navy px-8 py-3.5 font-body font-bold text-editorial-cream shadow-xl transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        Accept the invitation
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
      <p className="mt-3 text-center font-body text-[11px] leading-relaxed text-editorial-navy/70">
        Sign in, or open an account. Either way you return straight to the ballot.
      </p>
    </div>
  );
}