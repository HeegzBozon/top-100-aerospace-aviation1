import { FileText, Mic } from 'lucide-react';

// One chapter of the film: the slate, the material, the narration, and the
// interview excerpts. Everything shown here comes from the record itself.
export default function DocumentaryChapterView({ chapter }) {
  const { media } = chapter;

  return (
    <article className="doc-fade px-5 py-8 sm:px-10 sm:py-12">
      <header aria-live="polite">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-editorial-copper">
          Chapter {chapter.number}
        </p>
        <h2 className="mt-3 font-heading text-[30px] leading-[1.12] text-editorial-cream sm:text-[40px]">
          {chapter.title}
        </h2>
        {chapter.slate && (
          <p className="mt-3 font-body text-[11px] font-medium uppercase tracking-[0.22em] text-editorial-gold/80">
            {chapter.slate}
          </p>
        )}
      </header>

      <div
        className={`mt-8 grid gap-8 ${
          chapter.still || media ? 'lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]' : ''
        }`}
      >
        {(chapter.still || media) && (
          <figure className="doc-plate relative overflow-hidden">
            {media?.kind === 'clip' ? (
              <video src={media.url} controls playsInline className="h-full w-full object-cover" />
            ) : media?.kind === 'recording' ? (
              <div className="flex flex-col gap-3 p-5">
                <p className="flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-editorial-gold">
                  <Mic className="h-3.5 w-3.5" /> Interview recording
                </p>
                <audio src={media.url} controls className="w-full" />
                {media.caption && (
                  <figcaption className="font-body text-[11px] leading-relaxed text-editorial-cream/60">
                    {media.caption}
                  </figcaption>
                )}
              </div>
            ) : media?.kind === 'document' ? (
              <a
                href={media.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-editorial-cream/80"
              >
                <FileText className="h-4 w-4 text-editorial-gold" /> Open the document
              </a>
            ) : (
              <img
                src={media?.kind === 'photo' ? media.url : chapter.still}
                alt={media?.caption || chapter.title}
                className="doc-still h-full max-h-[520px] w-full object-cover"
                style={{ objectPosition: 'center 22%' }}
              />
            )}
            {(media?.kind === 'photo' || media?.kind === 'clip') && media?.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c1a2a] to-transparent px-4 pb-3 pt-8 font-body text-[10.5px] leading-relaxed text-editorial-cream/75">
                {media.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div className="space-y-6">
          {chapter.lines.map((line, i) => (
            <p
              key={i}
              className="doc-line border-l-2 border-editorial-copper/50 pl-5 font-body text-[15.5px] leading-[1.85] text-editorial-cream/85 sm:text-[16.5px]"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {line}
            </p>
          ))}

          {chapter.quotes.map((quote) => (
            <blockquote key={quote.label} className="border-t border-editorial-gold/25 pt-5">
              <p className="font-body text-[9.5px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
                {quote.label}
              </p>
              <p className="mt-2 font-heading text-[19px] leading-[1.5] text-editorial-cream/90 sm:text-[21px]">
                “{quote.text}”
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </article>
  );
}