import React, { useState, useEffect } from 'react';
import { BookOpen, Play, RotateCcw } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { readIssueProgress } from '@/lib/readingProgress';

// Cinematic opening sequence. Dark void → title reveal → cover image → "Begin Reading".
// Offers a passive "Play" path that starts narrated autoplay from the first page.
export default function IssueOpening({ issue, onBegin, onAutoPlay }) {
  const [stage, setStage] = useState(0); // 0=void, 1=kicker, 2=title, 3=cover, 4=button

  // Where this machine left the issue. The film does not open on the cover for a reader
  // who is halfway through it: the key says Resume, and it picks the film up where it was
  // put down. Start over sits under it for the reader who wants the cover after all.
  const progress = readIssueProgress(issue?.id);
  const place = progress?.page || 0;
  const resuming = place > 0 && (progress?.percent ?? 0) < 100;
  const finished = (progress?.percent ?? 0) >= 100;
  const filmLabel = resuming ? 'Resume' : finished ? 'Watch again' : 'Watch';

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 900),
      setTimeout(() => setStage(3), 1600),
      setTimeout(() => setStage(4), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{ background: P.navyVoid }}
      onClick={stage >= 4 ? onBegin : undefined}
      data-stage={stage}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${P.navy} 0%, ${P.navyVoid} 70%)`,
          opacity: stage >= 1 ? 0.6 : 0,
        }}
      />

      {/* Cover image background */}
      {issue.cover_image_url && (
        <div
          className="absolute inset-0 transition-all ease-out"
          style={{
            transitionDuration: '2000ms',
            opacity: stage >= 3 ? 0.35 : 0,
            transform: stage >= 3 ? 'scale(1.05)' : 'scale(1.15)',
          }}
        >
          <img src={issue.cover_image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${P.navyVoid}dd 0%, ${P.navyVoid}99 50%, ${P.navyVoid}dd 100%)` }} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-md">
        {/* Kicker */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: P.gold }}>
            {issue.cover_kicker || 'TOP 100 Aerospace & Aviation'}
          </span>
        </div>

        {/* Title */}
        <div
          className="transition-all duration-1000 mt-6"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          }}
        >
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight" style={{ color: P.cream }}>
            {issue.title}
          </h1>
        </div>

        {/* Gold rule */}
        <div
          className="transition-all duration-700 mt-8"
          style={{
            width: stage >= 3 ? '48px' : '0px',
            height: '1px',
            background: P.gold,
          }}
        />

        {/* Begin button */}
        <div
          className="transition-all duration-700 mt-10"
          style={{
            opacity: stage >= 4 ? 1 : 0,
            transform: stage >= 4 ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); onBegin?.(); }}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(201,168,124,0.14)', border: `1px solid ${P.gold}`, color: P.gold }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="uppercase tracking-[0.15em]">Read</span>
            </button>
            {onAutoPlay && (
              <button
                onClick={(e) => { e.stopPropagation(); onAutoPlay({ restart: !resuming }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${P.gold}, ${P.copper})`,
                  color: P.navyVoid,
                  boxShadow: '0 4px 20px rgba(201,168,124,0.3)',
                }}
              >
                {finished ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="uppercase tracking-[0.15em]">{filmLabel}</span>
              </button>
            )}
            {/* The film was put down part-read: carry on from the spread it stopped on, or
                begin the issue again from its cover. */}
            {resuming && (
              <button
                onClick={(e) => { e.stopPropagation(); onAutoPlay({ restart: true }); }}
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] transition-colors"
                style={{ color: 'rgba(250,248,245,0.5)' }}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Start over</span>
              </button>
            )}
            {resuming && (
              <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(250,248,245,0.32)' }}>
                Left off on page {String(place + 1).padStart(2, '0')} of {String(progress.total).padStart(2, '0')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom brand mark */}
      <div
        className="absolute bottom-6 left-0 right-0 text-center transition-opacity duration-1000"
        style={{ opacity: stage >= 2 ? 1 : 0 }}
      >
        <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: 'rgba(250,248,245,0.25)' }}>
          An Institutional Publication
        </span>
      </div>
    </div>
  );
}