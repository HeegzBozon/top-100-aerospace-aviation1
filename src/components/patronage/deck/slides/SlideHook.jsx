import { P } from '../../patronConfig';

export default function SlideHook() {
  return (
    <div className="flex flex-col justify-center py-1 md:py-4">
      <p className="font-heading text-[1.5rem] leading-[1.08] md:text-[2.6rem]" style={{ color: P.gold }}>
        Most aerospace media kits are pay-to-play.
      </p>
      <p className="mt-3 max-w-[30ch] font-heading text-[1.15rem] leading-tight text-editorial-cream md:mt-4 md:text-[1.9rem]">
        We built a governance-first firewall instead.
      </p>
      <p className="mt-5 max-w-[52ch] text-[12px] leading-relaxed text-editorial-cream/70 md:text-[13.5px]">
        A patron buys attribution on a dated, published calendar. Nothing a patron pays for
        reaches the index, the measurement, or a single line of editorial.
      </p>
    </div>
  );
}