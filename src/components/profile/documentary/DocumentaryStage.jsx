import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Play } from 'lucide-react';
import DocumentaryChapterView from './DocumentaryChapterView';
import DocumentaryControls from './DocumentaryControls';
import DocumentaryDirectorNote from './DocumentaryDirectorNote';
import { useDocumentaryVoice } from './useDocumentaryVoice';

const narrationOf = (chapter) =>
  [
    chapter.title,
    chapter.slate,
    ...chapter.lines,
    ...chapter.quotes.map((q) => `${q.label}. ${q.text}`),
  ]
    .filter(Boolean)
    .join('. ');

const runtimeOf = (chapters) => {
  const words = chapters.reduce(
    (total, c) =>
      total +
      [c.title, ...c.lines, ...c.quotes.map((q) => q.text)].join(' ').split(/\s+/).filter(Boolean).length,
    0
  );
  return Math.max(1, Math.round(words / 150));
};

// The film itself. It opens on a title card, plays only when pressed, and every
// chapter is drawn from whatever the record actually holds — so a sparse profile
// is a short film, not an empty one.
export default function DocumentaryStage({
  chapters,
  name,
  isOwner,
  settings,
  fellowEmail,
  onSaved,
  openPrompts,
  onSwitchToRead,
  onEnquire,
  enquiryLabel,
}) {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const { supported, speak, cancel } = useDocumentaryVoice();

  const canPlay = supported && voiceOn;
  const chapter = chapters[index];
  const runtime = useMemo(() => runtimeOf(chapters), [chapters]);

  useEffect(() => {
    if (!playing) cancel();
  }, [playing, cancel]);

  useEffect(() => {
    if (!playing || !started || !canPlay) return;
    const current = chapters[index];
    if (!current) {
      setPlaying(false);
      return;
    }
    let timer;
    speak(narrationOf(current), {
      onEnd: () => {
        if (index + 1 < chapters.length) {
          timer = window.setTimeout(() => setIndex(index + 1), 850);
        } else {
          setPlaying(false);
        }
      },
    });
    return () => {
      window.clearTimeout(timer);
      cancel();
    };
  }, [playing, started, index, chapters, canPlay, speak, cancel]);

  const jump = useCallback(
    (next) => {
      const target = Math.min(Math.max(next, 0), chapters.length - 1);
      setStarted(true);
      setIndex(target);
    },
    [chapters.length]
  );

  const togglePlay = () => {
    setStarted(true);
    setPlaying((p) => !p);
  };

  const toggleVoice = () => {
    cancel();
    setPlaying(false);
    setVoiceOn((v) => !v);
  };

  useEffect(() => {
    if (!started) return;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        jump(index + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        jump(index - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (canPlay) togglePlay();
      } else if (e.key === 'Escape') {
        onSwitchToRead();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, index, jump, canPlay, onSwitchToRead]);

  if (!chapters.length) return null;

  return (
    <div className="doc-stage">
      {!started ? (
        <div className="doc-title-card px-6 py-16 sm:px-12 sm:py-24">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.34em] text-editorial-copper">
            The documentary record
          </p>
          <h1 className="mt-5 max-w-3xl font-heading text-[38px] leading-[1.06] text-editorial-cream sm:text-[58px]">
            {name}
          </h1>
          <p className="mt-5 font-body text-[11px] font-medium uppercase tracking-[0.24em] text-editorial-gold/80">
            {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} · about {runtime}{' '}
            {runtime === 1 ? 'minute' : 'minutes'} · captioned
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2">
            <button type="button" onClick={togglePlay} disabled={!canPlay} className="doc-key-primary gap-2 px-5 py-2.5">
              <Play className="h-4 w-4" />
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.22em]">
                Begin the film
              </span>
            </button>
            <button
              type="button"
              onClick={() => jump(0)}
              className="doc-key gap-2 px-4 py-2.5"
            >
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em]">
                Step through
              </span>
            </button>
            <button type="button" onClick={onSwitchToRead} className="doc-key gap-2 px-4 py-2.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.2em]">
                Read instead
              </span>
            </button>
          </div>

          {!supported && (
            <p className="mt-5 max-w-md font-body text-[11px] leading-relaxed text-editorial-cream/50">
              This browser has no spoken narration. The film is fully captioned, so it plays as a
              visual documentary.
            </p>
          )}

          {enquiryLabel && onEnquire && (
            <button
              type="button"
              onClick={onEnquire}
              className="mt-8 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-editorial-gold underline decoration-editorial-gold/40 underline-offset-4"
            >
              {enquiryLabel}
            </button>
          )}
        </div>
      ) : (
        <>
          <DocumentaryChapterView key={chapter.key} chapter={chapter} />
          <DocumentaryControls
            chapters={chapters}
            index={index}
            playing={playing}
            canPlay={canPlay}
            voiceOn={voiceOn}
            onJump={jump}
            onPrev={() => jump(index - 1)}
            onNext={() => jump(index + 1)}
            onTogglePlay={togglePlay}
            onToggleVoice={toggleVoice}
            onSwitchToRead={onSwitchToRead}
          />
        </>
      )}

      {isOwner && (
        <DocumentaryDirectorNote
          activeChapter={chapter}
          chapters={chapters}
          openPrompts={openPrompts}
          settings={settings}
          fellowEmail={fellowEmail}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}