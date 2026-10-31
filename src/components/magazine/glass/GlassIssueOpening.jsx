import { useEffect, useRef, useState } from 'react';
import { BookOpen, Play, RotateCcw } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { readIssueProgress } from '@/lib/readingProgress';
import { useNavHint } from '@/components/handheld/faceHint';

// An issue's opening, played in the glass.
//
// The desk's opening is a full-screen film; on the handheld it is seated in the
// picture, under the same pane as everything else, so the device stays in the hand
// while the issue arrives. The reveal runs on its own timers, and the two ways in —
// reading it, or letting it play as a film — are walked on the ring as well as
// tapped.
export default function GlassIssueOpening({ issue, onBegin, onAutoPlay }) {
  const keyHint = useNavHint();
  const [stage, setStage] = useState(0);
  const [cursor, setCursor] = useState(0);
  const cursorRef = useRef(0);
  cursorRef.current = cursor;

  // Where this issue was left. A part-read issue gives the ring Resume at the place it
  // stopped, and Start over beside it for the reader who wants the cover again.
  const progress = readIssueProgress(issue?.id);
  const place = progress?.page || 0;
  const resuming = place > 0 && (progress?.percent ?? 0) < 100;
  const finished = (progress?.percent ?? 0) >= 100;
  const options = [
    { key: 'read', label: 'Read', icon: BookOpen },
    { key: 'film', label: resuming ? 'Resume' : finished ? 'Watch again' : 'Watch', icon: Play },
    ...(resuming ? [{ key: 'restart', label: 'Start over', icon: RotateCcw }] : []),
  ];
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 250),
      setTimeout(() => setStage(2), 800),
      setTimeout(() => setStage(3), 1500),
      setTimeout(() => setStage(4), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const choose = (index) => {
    const option = optionsRef.current[index];
    if (!option) return;
    if (option.key === 'film') onAutoPlay?.({ restart: !resuming });
    else if (option.key === 'restart') onAutoPlay?.({ restart: true });
    else onBegin?.();
  };

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => optionsRef.current.map((option) => option.label),
      index: () => cursorRef.current,
      step: (direction) => {
        const next = cursorRef.current + direction;
        if (next < 0 || next >= optionsRef.current.length) return null;
        setCursor(next);
        return optionsRef.current[next].label;
      },
      goTo: (index) => {
        if (index < 0 || index >= optionsRef.current.length) return null;
        setCursor(index);
        return optionsRef.current[index].label;
      },
      enter: () => {
        choose(cursorRef.current);
        return true;
      },
      back: () => false,
    };
  }

  useEffect(() => registerPicker(api.current), []);
  useEffect(() => {
    touchPicker();
  }, [cursor, stage]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-6 text-center"
      style={{ background: P.navyVoid }}
    >
      {/* The issue's own light, and its cover, arriving behind the type */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${P.navy} 0%, ${P.navyVoid} 72%)`,
          opacity: stage >= 1 ? 0.65 : 0,
        }}
      />
      {issue.cover_image_url && (
        <div
          className="pointer-events-none absolute inset-0 transition-all ease-out"
          style={{
            transitionDuration: '1800ms',
            opacity: stage >= 3 ? 0.32 : 0,
            transform: stage >= 3 ? 'scale(1.04)' : 'scale(1.14)',
          }}
        >
          <img src={issue.cover_image_url} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${P.navyVoid}e6 0%, ${P.navyVoid}99 52%, ${P.navyVoid}e6 100%)` }}
          />
        </div>
      )}

      <div className="relative z-10 flex w-full flex-col items-center">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.38em] transition-opacity duration-700"
          style={{ color: P.gold, opacity: stage >= 1 ? 1 : 0 }}
        >
          {issue.cover_kicker || 'TOP 100 Aerospace & Aviation'}
        </span>

        <h1
          className="mt-4 font-heading text-2xl leading-tight transition-all duration-1000"
          style={{
            color: P.cream,
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'translateY(0)' : 'translateY(14px)',
          }}
        >
          {issue.title}
        </h1>

        <div
          className="mt-5 h-px transition-all duration-700"
          style={{ width: stage >= 3 ? 44 : 0, background: P.gold }}
        />

        {/* The two ways in, walked on the ring */}
        <div
          className="mt-5 w-full space-y-1.5 transition-opacity duration-700"
          style={{ opacity: stage >= 4 ? 1 : 0 }}
        >
          {options.map((option, i) => {
            const Icon = option.icon;
            const active = i === cursor;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => { setCursor(i); choose(i); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors"
                style={{
                  background: active ? 'rgba(250,248,245,0.10)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(201,168,124,0.65)' : 'rgba(250,248,245,0.14)'}`,
                }}
              >
                <Icon className="h-3.5 w-3.5 flex-none" style={{ color: P.gold }} />
                <span className="min-w-0 flex-1 truncate text-[12px] font-medium" style={{ color: P.cream }}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {resuming && (
          <p className="mt-2 text-[7.5px] uppercase tracking-[0.16em]" style={{ color: 'rgba(250,248,245,0.3)' }}>
            Left off on page {String(place + 1).padStart(2, '0')} of {String(progress.total).padStart(2, '0')}
          </p>
        )}

        <p className="mt-3 text-[7.5px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(250,248,245,0.34)' }}>
          {keyHint({ open: 'Take' })}
        </p>
      </div>

      <p
        className="absolute bottom-4 left-0 right-0 text-center text-[8px] uppercase tracking-[0.28em] transition-opacity duration-1000"
        style={{ color: 'rgba(250,248,245,0.26)', opacity: stage >= 2 ? 1 : 0 }}
      >
        An Institutional Publication
      </p>
    </div>
  );
}