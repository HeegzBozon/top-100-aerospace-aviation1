import React, { useState, useEffect } from 'react';
import { BookOpen, Play } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// Cinematic opening sequence. Dark void → title reveal → cover image → "Begin Reading".
// Offers a passive "Play" path that starts narrated autoplay from the first page.
export default function IssueOpening({ issue, onBegin, onAutoPlay }) {
  const [stage, setStage] = useState(0); // 0=void, 1=kicker, 2=title, 3=cover, 4=button

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

        {/* Subtitle */}
        {issue.subtitle && (
          <div
            className="transition-all duration-700 mt-3"
            style={{
              opacity: stage >= 3 ? 1 : 0,
              transform: stage >= 3 ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            <p className="text-sm" style={{ color: 'rgba(250,248,245,0.6)' }}>{issue.subtitle}</p>
          </div>
        )}

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
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: P.gold }}>
              <BookOpen className="w-4 h-4" />
              <span className="uppercase tracking-[0.2em]">Begin Reading</span>
            </div>
            {onAutoPlay && (
              <button
                onClick={(e) => { e.stopPropagation(); onAutoPlay(); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${P.gold}, ${P.copper})`,
                  color: P.navyVoid,
                  boxShadow: '0 4px 20px rgba(201,168,124,0.3)',
                }}
              >
                <Play className="w-3.5 h-3.5" />
                <span className="uppercase tracking-[0.15em]">Play as Film</span>
              </button>
            )}
            <p className="text-[10px]" style={{ color: 'rgba(250,248,245,0.3)' }}>Tap anywhere to open</p>
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