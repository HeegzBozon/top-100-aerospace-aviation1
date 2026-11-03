import { useCallback, useEffect, useRef, useState } from 'react';
import { buildSlideSpecs } from '@/components/magazine/video/slideSpec';
import { drawSlide } from '@/components/magazine/video/drawSlide';

// The two cuts the export offers, and the paces a page can be held for.
export const VIDEO_FORMATS = [
  { key: 'vertical', label: 'Vertical', note: '9:16 · Shorts, Reels', width: 1080, height: 1920 },
  { key: 'landscape', label: 'Landscape', note: '16:9 · YouTube, embeds', width: 1920, height: 1080 },
];

export const VIDEO_PACES = [
  { key: 'quick', label: 'Quick', seconds: 2 },
  { key: 'standard', label: 'Standard', seconds: 3.5 },
  { key: 'slow', label: 'Slow', seconds: 6 },
];

const MIME_CANDIDATES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];

// What this browser can encode, or null when it cannot render video at all.
export const videoSupport = () => {
  if (typeof window === 'undefined') return null;
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return null;
  return MIME_CANDIDATES.find((type) => window.MediaRecorder.isTypeSupported?.(type)) || null;
};

// A picture that cannot be read is left out of its frame rather than breaking the render.
const loadImage = (url) => new Promise((resolve) => {
  if (!url) { resolve(null); return; }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = url;
});

const clock = (seconds) => {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

// Rendering an issue as a video file, on this machine.
//
// The frames are drawn to a canvas and the canvas is recorded as it plays, so the file is
// cut in real time: a four-minute film takes four minutes to make. That is the price of
// encoding without a server, and the panel says so before anything starts.
export default function useIssueVideoExport() {
  const [status, setStatus] = useState('idle'); // idle | preparing | recording | done | error
  const [progress, setProgress] = useState(0);
  const [shot, setShot] = useState(null); // { page, elapsed, seconds }
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { url, size, mime, seconds }

  const runRef = useRef({ cancelled: false, recorder: null, streams: [], frame: 0, url: null });

  const dropUrl = useCallback(() => {
    if (runRef.current.url) {
      URL.revokeObjectURL(runRef.current.url);
      runRef.current.url = null;
    }
  }, []);

  const stopEverything = useCallback(() => {
    runRef.current.cancelled = true;
    cancelAnimationFrame(runRef.current.frame);
    try { runRef.current.recorder?.stop(); } catch { /* already stopped */ }
    runRef.current.streams.forEach((track) => { try { track.stop(); } catch { /* gone */ } });
    runRef.current.streams = [];
  }, []);

  useEffect(() => () => { stopEverything(); dropUrl(); }, [stopEverything, dropUrl]);

  const reset = useCallback(() => {
    dropUrl();
    setResult(null);
    setError(null);
    setStatus('idle');
    setProgress(0);
    setShot(null);
  }, [dropUrl]);

  const cancel = useCallback(() => {
    stopEverything();
    setStatus('idle');
    setProgress(0);
    setShot(null);
  }, [stopEverything]);

  const start = useCallback(async ({ issue, pages, articles = [], format, secondsPerPage, totalPages }) => {
    const mime = videoSupport();
    if (!mime) {
      setError('This browser cannot render video. Chrome, Edge or Safari 14.1 and later can.');
      setStatus('error');
      return;
    }

    dropUrl();
    setResult(null);
    setError(null);
    setShot(null);
    setProgress(0);
    setStatus('preparing');

    const specs = buildSlideSpecs({ issue, pages, articles });

    // Every picture is read before the camera rolls: a frame that waits on a download is a
    // frame the recorder would have to hold.
    const pictures = await Promise.all(specs.map((spec) => loadImage(spec.imageUrl)));
    pictures.forEach((img, i) => { specs[i].img = img; });

    await (document.fonts?.ready || Promise.resolve());

    const cut = VIDEO_FORMATS.find((f) => f.key === format) || VIDEO_FORMATS[0];
    const { width, height } = cut;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30);
    if (!stream) {
      setError('This browser could not open a video stream from the canvas.');
      setStatus('error');
      return;
    }

    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 });
    runRef.current.recorder = recorder;
    runRef.current.streams = stream.getTracks();
    runRef.current.cancelled = false;

    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    recorder.onerror = () => {
      setError('The recorder stopped before the video was finished.');
      setStatus('error');
      stopEverything();
    };
    recorder.onstop = () => {
      if (runRef.current.cancelled) return;
      const blob = new Blob(chunks, { type: mime.split(';')[0] });
      const url = URL.createObjectURL(blob);
      runRef.current.url = url;
      setResult({ url, size: blob.size, mime, seconds: specs.length * secondsPerPage });
      setProgress(1);
      setStatus('done');
    };

    const per = Math.max(1, secondsPerPage) * 1000;
    const total = per * specs.length;
    const of = totalPages || specs.length;
    const folioOf = (spec) => `${String(spec.folio).padStart(2, '0')} / ${String(of).padStart(2, '0')}`;

    const paint = (spec, local, overall) => drawSlide(ctx, spec, {
      width, height, progress: local, overall, vertical: format === 'vertical', folio: folioOf(spec),
    });

    // The first frame is drawn before the recorder rolls, so no black frame opens the film.
    paint(specs[0], 0, 0);
    recorder.start(400);
    setStatus('recording');

    const began = performance.now() + 120;
    let shownPercent = -1;
    let shownSecond = -1;
    let shownIndex = -1;

    const tick = () => {
      if (runRef.current.cancelled) return;
      const elapsed = Math.max(0, performance.now() - began);
      const index = Math.min(specs.length - 1, Math.floor(elapsed / per));
      const local = Math.min(1, (elapsed - index * per) / per);
      const overall = Math.min(1, elapsed / total);
      paint(specs[index], local, overall);

      const percent = Math.round(overall * 100);
      if (percent !== shownPercent) {
        shownPercent = percent;
        setProgress(percent / 100);
      }
      const second = Math.floor(elapsed / 1000);
      if (index !== shownIndex || second !== shownSecond) {
        shownIndex = index;
        shownSecond = second;
        setShot({ page: specs[index].folio, elapsed, seconds: total / 1000 });
      }

      if (elapsed >= total) {
        paint(specs[specs.length - 1], 1, 1);
        window.setTimeout(() => {
          try { recorder.stop(); } catch { /* already stopped */ }
        }, 140);
        return;
      }
      runRef.current.frame = requestAnimationFrame(tick);
    };

    runRef.current.frame = requestAnimationFrame(tick);
  }, [dropUrl, stopEverything]);

  return { status, progress, shot, error, result, start, cancel, reset, clock };
}