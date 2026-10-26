import { AERO } from "./aeroConfig";

// A painted plate: one scene from the field, seated in a well with the act and
// the chapter printed along it. The art carries the atmosphere; everything that
// has to be read is DOM, so it stays sharp on a phone and readable at 402px.
export default function AeroPlate({ scene, act, chapter, caption, tall = false, children }) {
  return (
    <div className="af-plate" style={{ background: AERO.night }}>
      <img
        src={scene}
        alt=""
        className="block w-full object-cover"
        style={{ height: tall ? 164 : 118 }}
        loading="lazy"
      />

      <div className="relative px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.24em]" style={{ color: AERO.amber }}>
            {act}
          </p>
          <p className="af-readout text-[7.5px] font-bold uppercase tracking-[0.18em]" style={{ color: AERO.muted }}>
            {chapter}
          </p>
        </div>

        {caption ? (
          <p className="mt-1.5 font-heading text-[12.5px] leading-snug text-editorial-cream">{caption}</p>
        ) : null}

        {children}
      </div>
    </div>
  );
}