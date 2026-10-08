import React from 'react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// Renders a single magazine page's content based on its layout type and blocks.
// Used by both the flipbook and single-page reader.
export default function PageRenderer({ page, issue, pageNumber, totalPages }) {
  const blocks = page.content_blocks || [];
  const bg = page.background_image_url;

  // Cover page
  if (page.layout_type === 'cover') {
    return (
      <div className="relative w-full h-full overflow-hidden" style={{ background: bg ? 'transparent' : P.navy }}>
        {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center" style={{ background: bg ? 'linear-gradient(180deg, rgba(7,15,31,0.3) 0%, rgba(7,15,31,0.7) 100%)' : 'transparent' }}>
          {issue.cover_kicker && (
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 ppc-rise" style={{ color: P.gold, animationDelay: '0.2s' }}>
              {issue.cover_kicker}
            </span>
          )}
          <h1 className="font-serif text-2xl sm:text-3xl leading-tight ppc-rise" style={{ color: P.cream, animationDelay: '0.4s' }}>
            {issue.title}
          </h1>
          {issue.subtitle && (
            <p className="text-sm mt-3 ppc-rise" style={{ color: 'rgba(250,248,245,0.7)', animationDelay: '0.6s' }}>{issue.subtitle}</p>
          )}
          <div className="w-12 h-px mt-6 ppc-rise" style={{ background: P.gold, animationDelay: '0.8s' }} />
        </div>
      </div>
    );
  }

  // Chapter divider
  if (page.layout_type === 'chapter_divider') {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: P.navy }}>
        {page.chapter_number != null && (
          <span className="font-serif text-5xl sm:text-6xl mb-2 ppc-rise" style={{ color: P.gold, opacity: 0.4 }}>{String(page.chapter_number).padStart(2, '0')}</span>
        )}
        <div className="w-10 h-px my-4 ppc-rise" style={{ background: P.gold, animationDelay: '0.2s' }} />
        <h2 className="font-serif text-xl sm:text-2xl ppc-rise" style={{ color: P.cream, animationDelay: '0.3s' }}>
          {page.chapter_label || 'Chapter'}
        </h2>
      </div>
    );
  }

  // Pull quote (full-bleed)
  if (page.layout_type === 'pull_quote') {
    const quoteBlock = blocks.find((b) => b.type === 'pull_quote') || {};
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-10 text-center" style={{ background: P.cream }}>
        <div className="text-6xl font-serif leading-none mb-4" style={{ color: P.gold, opacity: 0.3 }}>“</div>
        <p className="font-serif text-lg sm:text-xl leading-relaxed ppc-rise" style={{ color: P.navy }}>
          {quoteBlock.text || 'A pull quote will appear here.'}
        </p>
        {quoteBlock.attribution && (
          <p className="text-xs mt-6 ppc-rise" style={{ color: P.copper, animationDelay: '0.2s' }}>— {quoteBlock.attribution}</p>
        )}
      </div>
    );
  }

  // Feature spread (full-bleed image with text)
  if (page.layout_type === 'feature_spread') {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {bg && <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(7,15,31,0.85) 100%)' }}>
          {blocks.filter((b) => b.type === 'heading').map((b, i) => (
            <h2 key={i} className="font-serif text-lg leading-tight mb-2" style={{ color: P.cream }}>{b.text}</h2>
          ))}
          {blocks.filter((b) => b.type === 'body').slice(0, 1).map((b, i) => (
            <p key={i} className="text-xs leading-relaxed line-clamp-3" style={{ color: 'rgba(250,248,245,0.8)' }}>{b.text}</p>
          ))}
        </div>
      </div>
    );
  }

  // Colophon
  if (page.layout_type === 'colophon') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: P.cream }}>
        <div className="w-10 h-px mb-6" style={{ background: P.copper }} />
        <p className="font-serif text-base mb-4" style={{ color: P.navy }}>Colophon</p>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(30,58,90,0.6)' }}>
          {issue.colophon || 'TOP 100 Aerospace & Aviation. An institutional publication.'}
        </p>
        <div className="w-10 h-px mt-6" style={{ background: P.copper }} />
      </div>
    );
  }

  // Masthead
  if (page.layout_type === 'masthead') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: P.cream }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4" style={{ color: P.gold }}>TOP 100</span>
        <h2 className="font-serif text-xl mb-2" style={{ color: P.navy }}>{issue.title}</h2>
        {issue.subtitle && <p className="text-xs" style={{ color: 'rgba(30,58,90,0.5)' }}>{issue.subtitle}</p>}
        <div className="w-10 h-px my-6" style={{ background: P.copper }} />
        {issue.preface && <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(30,58,90,0.7)' }}>{issue.preface}</p>}
      </div>
    );
  }

  // Profile
  if (page.layout_type === 'profile') {
    return (
      <div className="w-full h-full flex flex-col p-6" style={{ background: P.cream }}>
        {blocks.find((b) => b.type === 'image')?.url && (
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
            <img src={blocks.find((b) => b.type === 'image').url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {blocks.filter((b) => b.type === 'heading').map((b, i) => (
          <h2 key={i} className="font-serif text-lg text-center mb-1" style={{ color: P.navy }}>{b.text}</h2>
        ))}
        {blocks.filter((b) => b.type === 'byline').map((b, i) => (
          <p key={i} className="text-xs text-center mb-3" style={{ color: P.copper }}>{b.text}</p>
        ))}
        {blocks.filter((b) => b.type === 'body').slice(0, 3).map((b, i) => (
          <p key={i} className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(30,58,90,0.7)' }}>{b.text}</p>
        ))}
      </div>
    );
  }

  // Default: article page with content blocks
  return (
    <div className="w-full h-full overflow-hidden flex flex-col" style={{ background: P.cream }}>
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        {blocks.map((block, i) => <BlockRenderer key={i} block={block} />)}
      </div>
      {/* Page number footer */}
      <div className="flex-shrink-0 px-6 py-2 text-center" style={{ borderTop: `1px solid ${P.gold}20` }}>
        <span className="text-[10px] font-mono" style={{ color: 'rgba(30,58,90,0.3)' }}>
          {String(pageNumber).padStart(2, '0')} <span style={{ opacity: 0.5 }}>/ {String(totalPages).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}

function BlockRenderer({ block }) {
  switch (block.type) {
    case 'kicker':
      return <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: P.gold }}>{block.text}</p>;
    case 'heading':
      return <h2 className="font-serif text-lg sm:text-xl leading-tight mb-3" style={{ color: P.navy }}>{block.text}</h2>;
    case 'byline':
      return <p className="text-xs italic mb-4" style={{ color: P.copper }}>{block.text}</p>;
    case 'body':
      return <p className="text-xs sm:text-sm leading-relaxed mb-3" style={{ color: 'rgba(30,58,90,0.8)' }}>{block.text}</p>;
    case 'image':
      return (
        <figure className="mb-4">
          {block.url && <img src={block.url} alt={block.caption || ''} className="w-full rounded-lg mb-1" />}
          {block.caption && <figcaption className="text-[10px] text-center" style={{ color: 'rgba(30,58,90,0.4)' }}>{block.caption}</figcaption>}
        </figure>
      );
    case 'pull_quote':
      return (
        <blockquote className="my-4 pl-4" style={{ borderLeft: `3px solid ${P.gold}` }}>
          <p className="font-serif text-base italic leading-relaxed" style={{ color: P.navy }}>{block.text}</p>
          {block.attribution && <p className="text-xs mt-2" style={{ color: P.copper }}>— {block.attribution}</p>}
        </blockquote>
      );
    case 'divider':
      return <div className="w-12 h-px mx-auto my-4" style={{ background: P.gold, opacity: 0.4 }} />;
    case 'spacer':
      return <div className="h-4" />;
    default:
      return null;
  }
}