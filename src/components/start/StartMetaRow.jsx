import moment from "moment";

// The title screen's top rule: the hour's name on the left, the cycle's stamp on
// the right, closed by a hairline so the two read as one masthead line instead of
// floating in the air above the mark.
export default function StartMetaRow({ kicker }) {
  const stamp = moment().format("ddd D MMM · HH:mm");

  return (
    <div className="shrink-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.3em] text-editorial-copper md:text-[9.5px]">
          {kicker}
        </p>

        <p className="text-right text-[7.5px] font-bold uppercase tracking-[0.2em] text-editorial-cream/40 md:text-[9.5px]">
          <span className="text-editorial-cream/55">MMXXVI</span>
          <span className="mx-1.5 text-editorial-cream/25">·</span>
          {stamp}
        </p>
      </div>

      <div
        className="mt-2 h-px w-full md:mt-3"
        style={{
          background:
            "linear-gradient(90deg, rgb(var(--editorial-gold-rgb) / 0.42) 0%, rgb(var(--editorial-gold-rgb) / 0.08) 58%, transparent 100%)",
        }}
      />
    </div>
  );
}