import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const DURATION = 5000;

// Full-screen story viewer: progress bars, auto-advance, tap left/right.
export default function StoryViewer({ groups, startGroupIdx, onClose, viewerEmail }) {
  const [gIdx, setGIdx] = useState(startGroupIdx);
  const [sIdx, setSIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const group = groups[gIdx];
  const story = group?.stories[sIdx];

  const next = () => {
    if (!group) return;
    if (sIdx < group.stories.length - 1) {
      setSIdx((i) => i + 1);
    } else if (gIdx < groups.length - 1) {
      setGIdx((i) => i + 1);
      setSIdx(0);
    } else {
      onClose();
    }
    setProgress(0);
  };

  const prev = () => {
    if (sIdx > 0) {
      setSIdx((i) => i - 1);
    } else if (gIdx > 0) {
      const prevGroup = groups[gIdx - 1];
      setGIdx((i) => i - 1);
      setSIdx(prevGroup.stories.length - 1);
    }
    setProgress(0);
  };

  useEffect(() => {
    setSIdx(0);
    setProgress(0);
  }, [gIdx]);

  useEffect(() => {
    if (!story) return;
    setProgress(0);
    clearInterval(timerRef.current);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const p = (Date.now() - start) / DURATION;
      if (p >= 1) {
        clearInterval(timerRef.current);
        next();
      } else {
        setProgress(p);
      }
    }, 50);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gIdx, sIdx, story?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gIdx, sIdx]);

  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-2xl overflow-hidden bg-black" onClick={(e) => e.stopPropagation()}>
        <img src={story.media_url} alt="" className="absolute inset-0 w-full h-full object-contain" />

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
          {group.stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white transition-[width] duration-75" style={{ width: i < sIdx ? '100%' : i === sIdx ? `${progress * 100}%` : '0%' }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-4 pt-3 z-20">
          <div className="flex items-center gap-2">
            <img src={group.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-white text-sm font-semibold drop-shadow">{group.author.name}</span>
          </div>
          <button onClick={onClose} className="text-white"><X className="w-6 h-6" /></button>
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-20">
            <p className="text-white text-sm">{story.caption}</p>
          </div>
        )}

        {/* Tap zones */}
        <button onClick={prev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" aria-label="Previous" />
        <button onClick={next} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" aria-label="Next" />
      </div>
    </div>
  );
}