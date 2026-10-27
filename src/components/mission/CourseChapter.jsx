import { B } from '@/components/fellow-home/fellowHomeConfig';

// One chapter of the course, as a band across the page: its number, its name, what
// the chapter covers, and how much of it the reader has been through. A chapter
// that is fully read says so; one that is not names the count, so progress reads
// as a fact rather than a badge.
export default function CourseChapter({ chapter, readCount }) {
  const total = chapter.modules.length;
  const complete = total > 0 && readCount >= total;

  return (
    <section className="border-t pt-7 md:pt-9" style={{ borderColor: 'rgba(184,115,51,0.35)' }}>
      <div className="flex items-center gap-2.5">
        <span
          className="shrink-0 rounded-full px-2 py-[3px] text-[7.5px] font-bold uppercase tracking-[0.18em]"
          style={{ background: 'rgba(201,168,124,0.22)', border: '1px solid rgba(184,115,51,0.3)', color: B.copper }}
        >
          Chapter {chapter.index}
        </span>
        <span className="truncate font-heading text-[15px] md:text-[17px]" style={{ color: B.navy }}>
          {chapter.label}
        </span>
        <span
          className="ml-auto shrink-0 text-[8px] font-bold uppercase tracking-[0.22em]"
          style={{ color: complete ? B.copper : 'rgba(30,58,90,0.42)' }}
        >
          {complete ? 'Chapter complete' : `${readCount} of ${total} read`}
        </span>
      </div>

      {chapter.lede ? (
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed md:text-[13px]" style={{ color: B.muted }}>
          {chapter.lede}
        </p>
      ) : null}
    </section>
  );
}