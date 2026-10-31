import { useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";

// Handing a program to someone else, from its card on the title screen.
//
// Sharing from the menu does not throw a sheet over the menu — it puts the badge on. The
// person opposite meets a plate, a name and a code that already points at the program this
// key stands for, and the ways of passing it on without a scan (the address, the machine's
// own share sheet, the page itself) are printed on the badge beside it. So a share is the
// same object wherever it is pressed from: the badge, worn.
export default function ShareProgramButton({
  label,
  url,
  surface = "light",
  className = "",
}) {
  const navigate = useNavigate();

  const open = (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigate("/badge", { state: { shareUrl: url, shareLabel: label } });
  };

  const skin =
    surface === "dark"
      ? "border-editorial-gold/40 bg-editorial-cream/[0.08] text-editorial-gold hover:border-editorial-gold/80 hover:bg-editorial-cream/[0.16]"
      : "border-editorial-copper/35 bg-editorial-cream/70 text-editorial-copper hover:border-editorial-copper/80 hover:bg-editorial-cream";

  return (
    <button
      type="button"
      onClick={open}
      title={`Wear the badge to hand on ${label}`}
      aria-label={`Wear the badge to hand on ${label}`}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/70 ${skin} ${className}`}
    >
      <Share2 className="h-3 w-3" strokeWidth={1.9} />
    </button>
  );
}