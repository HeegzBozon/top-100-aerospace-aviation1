import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Eye, Download } from 'lucide-react';
import { composeCard, loadImage, WREATH_URL } from '@/components/og-card/ogCardComposer';

const YEAR = 2025;

export default function SingleCardPreview({ nominees }) {
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);

  const sorted = [...nominees].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const nominee = nominees.find(n => n.id === selectedId);

  useEffect(() => {
    if (!selectedId && sorted.length) {
      const giovanna = sorted.find(n => /giovanna/i.test(n.name || ''));
      setSelectedId((giovanna || sorted[0]).id);
    }
  }, [nominees]);

  const handlePreview = async () => {
    if (!nominee) return;
    setStatus('loading');
    try {
      const photoSrc = nominee.avatar_url || nominee.photo_url;
      const [photoImg, wreathImg] = await Promise.all([
        photoSrc ? loadImage(photoSrc).catch(() => null) : Promise.resolve(null),
        loadImage(WREATH_URL).catch(() => null),
      ]);
      composeCard(canvasRef.current, {
        photoImg,
        wreathImg,
        name: nominee.name,
        rank: nominee.finalRank,
        year: YEAR,
        title: nominee.title || nominee.professional_role,
        company: nominee.company || nominee.organization,
        country: nominee.country,
        sixWordStory: nominee.six_word_story,
        bio: nominee.description || nominee.bio,
      });
      setPreviewUrl(canvasRef.current.toDataURL('image/png'));
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `OG-${(nominee?.name || 'honoree').replace(/\s+/g, '-')}-${YEAR}.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-5">
      <h2 className="text-lg font-semibold mb-1">Preview a single card</h2>
      <p className="text-xs text-slate-400 mb-4">
        Renders one honoree locally. Nothing is uploaded and no record is changed.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={selectedId}
          onChange={e => { setSelectedId(e.target.value); setStatus('idle'); setPreviewUrl(null); }}
          className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white max-w-xs"
        >
          {sorted.map(n => (
            <option key={n.id} value={n.id}>#{n.finalRank} {n.name}</option>
          ))}
        </select>
        <button
          onClick={handlePreview}
          disabled={!nominee || status === 'loading'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c9a87c] text-[#0f1f35] font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          {status === 'loading' ? 'Composing…' : 'Preview card'}
        </button>
        {status === 'ready' && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-sm text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
        )}
      </div>

      {status === 'idle' && (
        <p className="text-sm text-slate-500">Choose an honoree and press Preview card.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-400">Could not compose this card. Try again.</p>
      )}
      {status === 'ready' && previewUrl && (
        <img src={previewUrl} alt={`OG card preview for ${nominee?.name}`} className="w-full max-w-2xl rounded-lg shadow-xl" />
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}