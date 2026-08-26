import { B } from '@/components/fellow-home/fellowHomeConfig';

// Identity page. Avatar, name, role, org, location. The six-word story
// as the editorial cover line. About blurb as the body copy.
export default function MastheadSpread({ nominee, settings, accent }) {
  const story = settings?.six_word_story || nominee?.six_word_story;
  const about = settings?.about_me || nominee?.bio || nominee?.description;
  return (
    <div className="h-full w-full flex flex-col p-10" style={{ background: B.cream }}>
      <div className="flex items-center justify-between mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.navy }}>Masthead</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Identity</span>
      </div>

      <div className="flex items-start gap-6 mb-8">
        {nominee?.avatar_url && (
          <img
            src={nominee.avatar_url}
            className="w-24 h-24 rounded-full object-cover flex-shrink-0"
            style={{ border: `3px solid ${accent}` }}
            alt=""
          />
        )}
        <div className="min-w-0">
          <h2 className="text-3xl font-bold mb-2" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {nominee?.name || 'Fellow'}
          </h2>
          {nominee?.title && <p className="text-sm" style={{ color: 'rgba(30,58,90,0.7)' }}>{nominee.title}</p>}
          {(nominee?.company || nominee?.organization) && (
            <p className="text-sm" style={{ color: 'rgba(30,58,90,0.7)' }}>{nominee.company || nominee.organization}</p>
          )}
          {nominee?.country && <p className="text-xs mt-1" style={{ color: 'rgba(30,58,90,0.5)' }}>{nominee.country}</p>}
        </div>
      </div>

      {story && (
        <blockquote className="border-l-2 pl-6 mb-8" style={{ borderColor: accent }}>
          <p className="text-2xl italic leading-relaxed" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            &ldquo;{story}&rdquo;
          </p>
        </blockquote>
      )}

      {about && (
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(30,58,90,0.75)' }}>{about}</p>
      )}
    </div>
  );
}