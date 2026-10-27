import { B } from '@/components/fellow-home/fellowHomeConfig';

// The course rail. Pinned to the head of the picture: how much of the course the
// reader has been through, then one cell per chapter with its own rule filling as
// that chapter is read. A reader always knows where they stand, and can jump.
export default function CourseRail({ chapters, activeChapter, readCount, total, onJump }) {
  const complete = total > 0 && readCount >= total;

  return (
    <div
      className="sticky top-0 z-20 -mx-4 mt-4 px-4 py-2.5 md:-mx-8 md:mt-8 md:px-8"
      style={{ background: 'rgba(250,248,245,0.94)', backdropFilter: 'blur(10px)' }}
    >
      <div className="flex items-end justify-between gap-3">
        <span className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
          The course
        </span>
        <span className="truncate text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
          {complete ? 'Read in full' : `${String(readCount).padStart(2, '0')}/${String(total).padStart(2, '0')} read`}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {chapters.map((chapter, i) => {
          const share = chapter.readCount / chapter.modules.length;
          return (
            <button
              key={chapter.key}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Chapter ${chapter.index}, ${chapter.label}, ${chapter.readCount} of ${chapter.modules.length} read`}
              aria-current={i === activeChapter ? 'step' : undefined}
              className="flex-1 text-left"
            >
              <span className="relative block h-[3px] overflow-hidden rounded-full" style={{ background: 'rgba(30,58,90,0.16)' }}>
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{ width: `${share * 100}%`, background: B.copper }}
                />
              </span>
              <span
                className="mt-1.5 block truncate text-[8px] font-bold tracking-[0.16em]"
                style={{ color: i === activeChapter ? B.navy : 'rgba(30,58,90,0.4)' }}
              >
                {chapter.index} {chapter.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}