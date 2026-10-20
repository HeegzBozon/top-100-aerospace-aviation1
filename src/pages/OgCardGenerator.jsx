import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, UploadCloud, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { renderCardToFile, loadImage, WREATH_URL } from '@/components/og-card/ogCardComposer';
import useTop100WomenNominees from '@/components/publication/useTop100WomenNominees';

const YEAR = 2025;

export default function OgCardGenerator() {
  const { nominees, loading: loadingNominees } = useTop100WomenNominees();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const [done, setDone] = useState([]);
  const [errors, setErrors] = useState([]);
  const [skipExisting, setSkipExisting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewCanvasRef = useRef(null);
  const wreathImgRef = useRef(null);

  // Preload wreath once
  React.useEffect(() => {
    loadImage(WREATH_URL).then(img => { wreathImgRef.current = img; }).catch(() => {});
  }, []);

  const totalCount = nominees.length;

  const handleGenerate = async () => {
    if (!totalCount) return;
    setRunning(true);
    setProgress(0);
    setDone([]);
    setErrors([]);

    // Ensure wreath is loaded
    if (!wreathImgRef.current) {
      try { wreathImgRef.current = await loadImage(WREATH_URL); } catch {}
    }

    let count = 0;
    for (const nominee of nominees) {
      setCurrentName(nominee.name);
      try {
        // Skip if already has a card and skipExisting is on
        if (skipExisting && nominee.og_card_url) {
          count++;
          setProgress(count);
          setDone(prev => [...prev, { name: nominee.name, rank: nominee.finalRank, skipped: true }]);
          continue;
        }

        const photoSrc = nominee.avatar_url || nominee.photo_url;
        const file = await renderCardToFile(
          {
            photoSrc,
            name: nominee.name,
            rank: nominee.finalRank,
            year: YEAR,
            title: nominee.title || nominee.professional_role,
            company: nominee.company || nominee.organization,
            country: nominee.country,
            sixWordStory: nominee.six_word_story,
            bio: nominee.description || nominee.bio,
          },
          wreathImgRef.current
        );

        // Upload (stored publicly — anyone with the link can open them)
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });

        // Store URL on nominee
        await base44.entities.Nominee.update(nominee.id, { og_card_url: file_url });

        // Show first card as preview
        if (count === 0) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }

        setDone(prev => [...prev, { name: nominee.name, rank: nominee.finalRank, url: file_url }]);
      } catch (err) {
        console.error(`Failed for ${nominee.name}:`, err);
        setErrors(prev => [...prev, { name: nominee.name, rank: nominee.finalRank, error: err.message || 'Unknown error' }]);
      }
      count++;
      setProgress(count);
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    setRunning(false);
    setCurrentName('');
  };

  const successCount = done.filter(d => !d.skipped).length;
  const skippedCount = done.filter(d => d.skipped).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">OG Card Generator — Top 100 Women {YEAR}</h1>
        <p className="text-sm text-slate-400 mb-6">
          Deterministically composes each honoree's real photo into the 1200×630 social card,
          uploads the PNG (stored publicly — anyone with the link can open them),
          and stores the URL on each nominee record as <code className="text-slate-300">og_card_url</code>.
        </p>

        {loadingNominees ? (
          <div className="flex items-center gap-2 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading ranked honorees…
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button
                onClick={handleGenerate}
                disabled={running || !totalCount}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c9a87c] text-[#0f1f35] font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {running ? 'Generating…' : `Generate & Upload All ${totalCount}`}
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipExisting}
                  onChange={e => setSkipExisting(e.target.checked)}
                  className="w-4 h-4 accent-[#c9a87c]"
                />
                Skip nominees that already have an OG card
              </label>
            </div>

            {/* Progress */}
            {(running || progress > 0) && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">
                    {progress} / {totalCount}
                    {currentName && running && ` — ${currentName}`}
                  </span>
                  <span className="text-slate-400">
                    {successCount} generated · {skippedCount} skipped · {errors.length} errors
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c9a87c] transition-all"
                    style={{ width: `${totalCount ? (progress / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Preview of first generated card */}
            {previewUrl && (
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-2">Latest generated card:</p>
                <img src={previewUrl} alt="OG card preview" className="w-48 rounded-lg shadow-xl" />
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                  <AlertTriangle className="w-4 h-4" /> {errors.length} error(s)
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {errors.map((e, i) => (
                    <div key={i} className="text-sm text-red-300 bg-red-950/30 rounded px-3 py-1.5">
                      #{e.rank} {e.name}: {e.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results list */}
            {done.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                  <CheckCircle2 className="w-4 h-4" /> {done.length} processed
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {done.map((d, i) => (
                    <div key={i} className="text-sm bg-slate-800 rounded px-3 py-2 flex items-center gap-2">
                      {d.skipped ? (
                        <span className="text-slate-500">#{d.rank} {d.name} (skipped)</span>
                      ) : (
                        <>
                          <span className="text-slate-300">#{d.rank} {d.name}</span>
                          {d.url && (
                            <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-[#c9a87c] text-xs underline ml-auto">
                              view
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {progress === totalCount && !running && (
              <div className="mt-6 flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Complete — all {totalCount} honorees processed.</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}