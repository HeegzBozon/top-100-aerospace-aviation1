import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";

// Handing a program to someone else, from its card on the title screen.
//
// The platform's own share sheet where the machine has one, and the address on the
// clipboard where it does not — pressing it again inside a couple of seconds says so.
// It sits above the plate's link, so sharing never opens the program by accident.
export default function ShareProgramButton({
  label,
  url,
  surface = "light",
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const share = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const target = /^https?:/i.test(url || "")
      ? url
      : `${window.location.origin}${url || ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: label, url: target });
        return;
      }
      await navigator.clipboard?.writeText(target);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // A share sheet the reader dismissed is not a failure.
    }
  };

  const skin =
    surface === "dark"
      ? "border-editorial-gold/40 bg-editorial-cream/[0.08] text-editorial-gold hover:border-editorial-gold/80 hover:bg-editorial-cream/[0.16]"
      : "border-editorial-copper/35 bg-editorial-cream/70 text-editorial-copper hover:border-editorial-copper/80 hover:bg-editorial-cream";

  const Icon = copied ? Check : Share2;

  return (
    <button
      type="button"
      onClick={share}
      title={copied ? "Link copied" : `Share ${label}`}
      aria-label={copied ? "Link copied" : `Share ${label}`}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/70 ${skin} ${className}`}
    >
      <Icon className="h-3 w-3" strokeWidth={1.9} />
    </button>
  );
}