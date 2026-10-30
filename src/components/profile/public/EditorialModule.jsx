import { Quote } from 'lucide-react';

// The Fellow's own voice, set as the centre well of the record: the anchor word
// and the six-word story on the left, the account itself on the right. Read-only
// on a public profile — expression is written in the record, never here.
export default function EditorialModule({ user, settings }) {
  const oneWord = user?.one_word || '';
  const sixWord = settings?.six_word_story || user?.six_word_story || '';
  const about = settings?.about_me || user?.bio || user?.professional_bio || '';

  if (!oneWord && !sixWord && !about) {
    return (
      <div className="border border-dashed border-editorial-copper/40 px-6 py-10 text-center">
        <Quote className="mx-auto h-6 w-6 text-editorial-copper/60" strokeWidth={1.6} />
        <p className="mt-4 font-heading text-[19px] text-editorial-navy">Nothing published in their voice yet.</p>
        <p className="mx-auto mt-2 max-w-sm font-body text-[12px] leading-relaxed text-editorial-navy/55">
          This Fellow has not set their anchor word, six-word story, or account. The record below stands on its own.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col gap-8">
        {oneWord && (
          <div>
            <p className="pd-label">One word</p>
            <p className="mt-3 font-heading text-[2.1rem] uppercase leading-none tracking-[0.14em] text-editorial-navy">
              {oneWord}
            </p>
          </div>
        )}
        {sixWord && (
          <div>
            <p className="pd-label">Six words</p>
            <p className="mt-3 font-heading text-[20px] italic leading-snug text-editorial-navy/85">
              &ldquo;{sixWord}&rdquo;
            </p>
          </div>
        )}
      </div>

      {about && (
        <div className="border-t border-editorial-copper/25 pt-7 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
          <p className="pd-label">In their own words</p>
          <p className="mt-4 whitespace-pre-wrap font-body text-[14.5px] leading-[1.85] text-editorial-navy/80">
            {about}
          </p>
        </div>
      )}
    </div>
  );
}