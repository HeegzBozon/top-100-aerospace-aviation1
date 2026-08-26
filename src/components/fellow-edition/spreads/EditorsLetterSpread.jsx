import { B } from '@/components/fellow-home/fellowHomeConfig';

// The Fellow's voice — their about blurb reframed as an editor's letter.
// Signed with their name and role. Reads as institutional correspondence.
export default function EditorsLetterSpread({ nominee, settings, accent }) {
  const letter = settings?.about_me || nominee?.bio || nominee?.description;
  return (
    <div className="h-full w-full flex flex-col p-10" style={{ background: B.cream }}>
      <div className="flex items-center justify-between mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.navy }}>Editor&rsquo;s Letter</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>In their words</span>
      </div>

      <div className="h-px w-16 mb-8" style={{ background: accent }} />

      {letter ? (
        <p className="text-base leading-relaxed flex-1" style={{ color: 'rgba(30,58,90,0.85)' }}>
          {letter}
        </p>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm italic" style={{ color: 'rgba(30,58,90,0.4)' }}>
            The editor&rsquo;s letter will appear here once written.
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(30,58,90,0.12)' }}>
        <p className="text-sm font-bold" style={{ color: B.navy }}>{nominee?.name || 'The Fellow'}</p>
        {nominee?.title && <p className="text-xs" style={{ color: 'rgba(30,58,90,0.55)' }}>{nominee.title}</p>}
      </div>
    </div>
  );
}