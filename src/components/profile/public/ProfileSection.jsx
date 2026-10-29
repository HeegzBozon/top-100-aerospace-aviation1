import React from 'react';

// One module of the public record. Every module is a plate of the same dossier:
// a copper rule across its head, the label in small caps, the numeral of its
// place in the Fellow's own order, then the material itself. The rule is the
// structure — the expression lives in what is set beneath it.
export default function ProfileSection({ index, label, title, note, children }) {
  return (
    <section className="px-6 py-14 sm:py-16 lg:px-14 lg:py-20">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-baseline justify-between gap-4">
          <p className="pd-label">{label}</p>
          <span className="font-heading text-[12px] tabular-nums tracking-[0.12em] text-editorial-copper/70">{index}</span>
        </div>
        <div className="pd-rule mt-3 w-full" />

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <h2 className="font-heading text-[26px] leading-[1.1] text-editorial-navy sm:text-[34px]">{title}</h2>
          {note && (
            <p className="max-w-sm font-body text-[11.5px] leading-relaxed text-editorial-navy/55">{note}</p>
          )}
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}