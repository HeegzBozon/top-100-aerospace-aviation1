// The AeroSync mark: the masthead rule in copper running into rose gold, the product set
// in the editorial serif, and what it is underneath. The same lockup as the platform's
// title screen, so the two screens read as one house rather than as two apps.
export default function AeroSyncMark() {
  return (
    <div className="shrink-0">
      <div
        className="h-px w-24 md:w-56"
        style={{ background: "linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)" }}
      />

      <h1 className="mt-3 font-heading text-[2.5rem] leading-[0.95] tracking-[-0.01em] text-editorial-cream md:text-7xl">
        AeroSync
      </h1>

      <p className="mt-2 text-[8.5px] font-bold uppercase tracking-[0.34em] text-editorial-cream/60 md:text-[11px]">
        CRM &middot; Conference Relationships
      </p>
    </div>
  );
}