import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Promotes the Fellow's bulletin dispatches and field notes from the feed
// into the bound issue. The most recent published entries render here.
export default function DispatchesSpread({ fellowEmail, accent }) {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    base44.entities.Bulletin.filter(
      { author_email: fellowEmail, status: 'published' },
      '-published_date',
      5
    )
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [fellowEmail]);

  if (!posts) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={{ background: B.cream }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(30,58,90,0.15)', borderTopColor: accent }} />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-10" style={{ background: B.cream }}>
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.navy }}>Dispatches</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>From the field</span>
      </div>

      <div className="h-px w-16 mb-6" style={{ background: accent }} />

      {posts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm italic" style={{ color: 'rgba(30,58,90,0.4)' }}>
            No dispatches published yet.
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-5 overflow-hidden">
          {posts.map((p) => (
            <article key={p.id}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: accent }}>
                {p.post_type === 'field_note' ? 'Field Note' : p.post_type === 'dispatch' ? 'Dispatch' : 'Note'}
              </p>
              {p.title && (
                <h3 className="text-base font-bold mb-1" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {p.title}
                </h3>
              )}
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'rgba(30,58,90,0.7)' }}>
                {p.body || p.rich_body?.replace(/<[^>]+>/g, '') || ''}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}