import { useEffect, useState } from 'react';
import { ARCADE_PROGRESS_EVENT, clearProgress, readProgress } from './arcadeProgress';

// The hall's own state, read from the device and kept in step with whatever machine was
// just played, so a badge struck mid-visit lights up without a reload.
export default function useArcadeProgress() {
  const [progress, setProgress] = useState(readProgress);

  useEffect(() => {
    const sync = () => setProgress(readProgress());
    window.addEventListener(ARCADE_PROGRESS_EVENT, sync);
    return () => window.removeEventListener(ARCADE_PROGRESS_EVENT, sync);
  }, []);

  const clear = () => {
    clearProgress();
    setProgress(readProgress());
  };

  return { progress, clear };
}