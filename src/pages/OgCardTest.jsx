import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Download } from 'lucide-react';
import { composeCard, loadImage, WREATH_URL } from '@/components/og-card/ogCardComposer';

const TEST_NOMINEE_ID = '696ae3d7baa38cad677d48a2';
const TEST_RANK = 2;
const TEST_YEAR = 2025;

export default function OgCardTest() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [nominee, setNominee] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const n = await base44.entities.Nominee.get(TEST_NOMINEE_ID);
        if (cancelled) return;
        setNominee(n);
        const photoSrc = n.avatar_url || n.photo_url;
        const [photoImg, wreathImg] = await Promise.all([
          loadImage(photoSrc).catch(() => null),
          loadImage(WREATH_URL).catch(() => null),
        ]);
        if (cancelled) return;
        composeCard(canvasRef.current, {
          photoImg, wreathImg,
          name: n.name, rank: TEST_RANK, year: TEST_YEAR,
        });
        setPreviewUrl(canvasRef.current.toDataURL('image/png'));
        setStatus('ready');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `OG-${(nominee?.name || 'honoree').replace(/\s+/g, '-')}-2025.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">OG Card Test — Portrait Composition</h1>
        <p className="text-sm text-slate-400">Deterministic canvas render using the nominee's real uploaded photo.</p>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin" /> Composing card…
        </div>
      )}
      {status === 'error' && (
        <p className="text-red-400">Failed to load nominee or compose card.</p>
      )}

      {status === 'ready' && (
        <>
          <div className="rounded-xl overflow-hidden shadow-2xl" style={{ width: 360 }}>
            <img src={previewUrl} alt="OG card preview" className="w-full block" />
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c9a87c] text-[#0f1f35] font-semibold hover:opacity-90 transition"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
          <p className="text-xs text-slate-500 max-w-md text-center">
            1080×1350 (4:5). Her real LinkedIn photo is composited into the copper laurel template.
            Name text is rendered deterministically — no AI, no misspellings.
          </p>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}