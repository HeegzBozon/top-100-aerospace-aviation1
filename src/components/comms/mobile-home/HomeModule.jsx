// Every zone of the mobile home is a named module: a copper tick, a micro
// kicker and a hairline rule, then the zone itself. The rule marks where one
// module ends and the next begins, and data-hh-module is what the console's
// click wheel uses to step between them.
export default function HomeModule({ label, children, isDarkMode = false, className = "" }) {
  const muted = isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(30,58,90,0.5)";
  const rule = isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(30,58,90,0.12)";

  return (
    <section data-hh-module={label} className={`px-4 pb-1 ${className}`}>
      <header className="mb-2.5 flex items-center gap-2">
        <span className="h-[3px] w-[3px] shrink-0 rounded-full" style={{ background: "#B87333" }} />
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.26em]" style={{ color: muted }}>
          {label}
        </span>
        <span className="h-px flex-1" style={{ background: rule }} />
      </header>
      {children}
    </section>
  );
}