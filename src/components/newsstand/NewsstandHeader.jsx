import { C } from '@/components/crm/crmConfig';

// The sign over the shop, folded into the tabs: the name, one line saying what the stand
// carries, then the two leaves with their counts. The awning is the tab strip now, so
// nothing else is printed here.
export default function NewsstandHeader() {
  return (
    <header>
      <p className="text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: C.copper }}>
        The Newsstand
      </p>
      <h1
        className="mt-1.5 font-heading text-[1.55rem] leading-[1.02] tracking-[-0.01em] md:text-[2.4rem]"
        style={{ color: C.navy }}
      >
        Everything we print, under one awning.
      </h1>
    </header>
  );
}