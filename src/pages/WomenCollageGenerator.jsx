import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Download, AlertTriangle, ImageOff } from 'lucide-react';
import { composeCollage, COLLAGE } from '@/components/og-card/womenCollageComposer';
import { loadImage } from '@/components/og-card/ogCardComposer';

// The published edition's honoree set — the same snapshot that generates the 100
// static honoree pages, so the collage and those pages always agree.
const SNAPSHOT_URL = '/data/honorees.json';

// Fetch each headshot as a blob first: a same-origin blob URL can't taint the
// canvas, so one unreachable photo degrades to a brand mark rather than failing
// the whole composition.
async function loadPhoto(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const url = URL.createObjectURL(await res.blob());
    const img = await loadImage(url);
    return { img, url };
  } catch {
    return null;
  }
}

export default function WomenCollageGenerator() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const compose = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(SNAPSHOT_URL);
      if (!res.ok) throw new Error(`Couldn't load the honoree snapshot (${res.status}).`);
      const raw = await res.json();
      // Alphabetical, so a cell's position never implies a standing.
      const honorees = (Array.isArray(raw) ? raw : [])
        .filter((h) => h && h.name)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))
        .slice(0, COLLAGE.CAPACITY);

      if (!honorees.length) {
        setStatus('empty');
        return;
      }

      const images = await Promise.all(
        honorees.map((h) => (h.photo ? loadImage(h.photo).catch(() => null) : Promise.resolve(null)))
      );

      composeCollage(canvasRef.current, { honorees, images });
      setStats({ honorees: honorees.length, photos: images.filter(Boolean).length });
      setStatus('ready');
    } catch (e) {
      setError(e.message || 'Composition failed.');
      setStatus('error');
    }
  }, []);

  useEffect(() => { compose(); }, [compose]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'top100-women-2025-collage.png';
    link.click();
    URL.revokeObjectURL(url);
  };

  const placeholders = stats ? stats.honorees - stats.photos : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Social Preview Generator — Top 100 Women 2025</h1>
        <p className="text-sm text-slate-400 mb-6">
          Composes the {COLLAGE.CAPACITY} published honorees' real photos into one 1200 × 630 image:
          a {COLLAGE.COLS} × {COLLAGE.ROWS} contact sheet in the brand duotone, with the edition set beneath.
          Download it and attach it wherever the preview is needed.
        </p>

        {status === 'loading' && (
          <div className="flex items-center gap-2 text-slate-300 py-10">
            <Loader2 className="w-5 h-5 animate-spin" />
            Composing the collage from {COLLAGE.CAPACITY} honoree photos…
          </div>
        )}

        {status === 'empty' && (
          <div className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/60 p-5">
            <ImageOff className="w-5 h-5 text-[#c9a87c] mt-0.5" />
            <div>
              <p className="font-semibold">No honorees found in the edition snapshot.</p>
              <p className="text-sm text-slate-400 mt-1">
                The collage draws from the published honoree set. Once that set is generated, this page will compose it.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start gap-3 rounded-lg border border-red-900 bg-red-950/40 p-5">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">The collage couldn't be composed.</p>
              <p className="text-sm text-red-300/80 mt-1">{error}</p>
              <button
                onClick={compose}
                className="mt-4 px-4 py-2 rounded-lg bg-[#c9a87c] text-[#0f1f35] text-sm font-semibold hover:opacity-90 transition"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className={status === 'ready' ? 'block' : 'hidden'}>
          <canvas
            ref={canvasRef}
            width={COLLAGE.W}
            height={COLLAGE.H}
            aria-label="Top 100 Women 2025 social preview collage"
            className="w-full h-auto rounded-lg shadow-xl border border-slate-700"
          />

          <div className="flex flex-wrap items-center gap-4 mt-5">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c9a87c] text-[#0f1f35] font-semibold hover:opacity-90 transition"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              onClick={compose}
              className="px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition"
            >
              Recompose
            </button>
            {stats && (
              <p className="text-sm text-slate-400">
                1200 × 630 · {stats.honorees} honorees · {stats.photos} photos composed
                {placeholders > 0 && ` · ${placeholders} brand mark${placeholders > 1 ? 's' : ''} for missing photos`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}